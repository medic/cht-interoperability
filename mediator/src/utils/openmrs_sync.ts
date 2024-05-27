import { getFhirResourcesSince, updateFhirResource, getIdType, copyIdToNamedIdentifier, getFhirResource } from './fhir'
import { getOpenMRSResourcesSince, createOpenMRSResource } from './openmrs'
import { buildOpenMRSPatient, buildOpenMRSVisit, openMRSIdentifierType } from '../mappers/openmrs'
import { createChtPatient, chtRecordFromObservations } from './cht'

interface ComparisonResources {
  fhirResources: fhir4.Resource[],
  openMRSResources: fhir4.Resource[]
}

/*
  Get resources updates in the last day from both OpenMRS and the FHIR server
*/
async function getResources(resourceType: string): Promise<ComparisonResources> {
  const lastUpdated = new Date();
  lastUpdated.setDate(lastUpdated.getDate() - 1);

  const fhirResponse = await getFhirResourcesSince(lastUpdated, resourceType);
  const fhirResources: fhir4.Resource[] = fhirResponse.data.entry?.map((entry: any) => entry.resource) || [];

  const openMRSResponse = await getOpenMRSResourcesSince(lastUpdated, resourceType);
  const openMRSResources: fhir4.Resource[] = openMRSResponse.data.entry?.map((entry: any) => entry.resource) || [];

  return { fhirResources: fhirResources, openMRSResources: openMRSResources };
}

interface ComparisonResult {
  toupdate: fhir4.Resource[],
  incoming: fhir4.Resource[],
  outgoing: fhir4.Resource[]
}

/*
  Compares the rsources in OpenMRS and FHIR
  the getKey argument is a function that gets an id for each resource
  that is expected to be the same value in both OpenMRS and the FHIR Server

  returns lists of resources
  that are in OpenMRS but not FHIR (incoming)
  that are in FHIR but not OpenMRS (outgoing)
  that are in both (toupdate)
*/
export async function compare(
  getKey: (resource: any) => string,
  resourceType: string
): Promise<ComparisonResult> {
  const results: ComparisonResult = {
    toupdate: [],
    incoming: [],
    outgoing: []
  }

  const comparison = await getResources(resourceType);
  // get the key for each resource and create a Map
  const fhirIds = new Map(comparison.fhirResources.map(resource => [getKey(resource), resource]));

  comparison.openMRSResources.forEach((openMRSResource) => {
    const key = getKey(openMRSResource);
    if (fhirIds.has(key)) {
      // ok so the fhir server already has it
      results.toupdate.push(openMRSResource);
      fhirIds.delete(key);
    } else {
      results.incoming.push(openMRSResource);
    }
  });

  fhirIds.forEach((resource, key) => {
    results.outgoing.push(resource);
  });

  return results;
}

/*
  Sync Patients between OpenMRS and FHIR
  compare patient resources
  for incoming, creates them in the FHIR server and forwars to CHT
  for outgoing, sends them to OpenMRS, receives the ID back, and updates the ID
*/
export async function syncPatients(){
  const getKey = (fhirPatient: any) => { return getIdType(fhirPatient, openMRSIdentifierType) || fhirPatient.id };
  const results: ComparisonResult = await compare(getKey, 'Patient');

  results.incoming.forEach(async (openMRSResource) => {
    const patient = openMRSResource as fhir4.Patient;
    copyIdToNamedIdentifier(patient, patient, openMRSIdentifierType);
    const response = await updateFhirResource(patient);
    if (response.status == 200 || response.status == 201) {
      createChtPatient(response.data);
    }
  });

  /*
  results.toupdate.forEach(async (openMRSResource) => {
    const chtDocId = openMRSPatient.getIdType(chtIdentifierType)
    if (! chtDocId ){
      const response = await updateOpenMRSResource({ ...openMRSResource, resourceType: 'Patient' });
    }
  });
  */

  results.outgoing.forEach(async (resource) => {
    const patient = resource as fhir4.Patient;
    const openMRSPatient = buildOpenMRSPatient(patient);
    const response = await createOpenMRSResource(openMRSPatient);
    // copy openmrs identifier if successful
    if (response.status == 200 || response.status == 201) {
      copyIdToNamedIdentifier(response.data, patient, openMRSIdentifierType);
      updateFhirResource(patient);
    }
  });
}

/*
  Sync Encounters and Observations
  For incoming encounters, saves them to FHIR Server, then gathers related Observations
  And send to CHT the Encounter together with its observations
  For outgoing, converts to OpenMRS format and sends to OpenMRS
  Updates to Observations and Encounters are not allowed
*/
export async function syncEncountersAndObservations(){
  const getEncounterKey = (encounter: any) => { return getIdType(encounter, openMRSIdentifierType) || encounter.id };
  const encounters: ComparisonResult = await compare(getEncounterKey, 'Encounter');

  // observations are defined by their relataed encounter and code
  const getObservationKey = (observation: any) => {
    return getEncounter(observation) + observation.code.coding[0].code;
  };
  const observations: ComparisonResult = await compare(getObservationKey, 'Observation');

  const encountersToCht = new Map();

  // for each incoming encounter, save it to fhir
  // it will be forwarded to cht below, when its encounters are gathered
  encounters.incoming.forEach(async (openMRSResource) => {
    const encounter = openMRSResource as fhir4.Encounter;
    copyIdToNamedIdentifier(encounter, encounter, openMRSIdentifierType);
    const response = await updateFhirResource(encounter);

    // save to map to push to cht below
    encountersToCht.set(getEncounterKey(encounter), {
      observations: [],
      encounter: encounter
    });
  });

  function getEncounter(observation: fhir4.Observation) {
    return observation.encounter?.reference?.split('/')[1] || '';
  };

  observations.incoming.forEach(async (openMRSResource) => {
    // group by encounter to forward to cht below
    const observation = openMRSResource as fhir4.Observation;
    encountersToCht.get(getEncounter(observation)).observations.push(observation);
    const response = await updateFhirResource(openMRSResource);
  });

  // for outgoing encounters, get the openMRS patient id and then forward to OpenMRS
  encounters.outgoing.forEach(async (resource) => {
    const encounter = resource as fhir4.Encounter;
    const patientId = encounter.subject?.reference?.split('/')[1] || '';
    const patientResponse = await getFhirResource(patientId, 'Patient');
    if (patientResponse.status == 200) {
      const patient = patientResponse.data as fhir4.Patient;
      const openMRSPatientId = getIdType(patient, openMRSIdentifierType);
      const openMRSVisit = buildOpenMRSVisit(openMRSPatientId, encounter);
      const response = await createOpenMRSResource(openMRSVisit[0]);
    }
  });

  observations.outgoing.forEach(async (resource) => {
    const response = await createOpenMRSResource(resource);
  });

  encountersToCht.forEach(async (key: string, value: any) => {
    const patientId = value.encounter.subject.reference.split('/')[1];
    const response = await chtRecordFromObservations(patientId, value.observations);
  });
}
