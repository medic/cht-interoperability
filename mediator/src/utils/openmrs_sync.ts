import {
  getFhirResourcesSince,
  updateFhirResource,
  createFhirResource,
  getIdType,
  copyIdToNamedIdentifier,
  getFhirResource,
  replaceReference,
  getFHIRPatientResource
} from './fhir'
import { getOpenMRSResourcesSince, createOpenMRSResource } from './openmrs'
import { buildOpenMRSPatient, buildOpenMRSVisit, buildOpenMRSObservation, openMRSIdentifierType } from '../mappers/openmrs'
import { createChtPatient, chtRecordFromObservations } from './cht'

interface ComparisonResources {
  fhirResources: fhir4.Resource[],
  openMRSResources: fhir4.Resource[],
  references: fhir4.Resource[]
}

/*
  Get resources updates in the last day from both OpenMRS and the FHIR server
*/
async function getResources(resourceType: string): Promise<ComparisonResources> {
  const lastUpdated = new Date();
  lastUpdated.setDate(lastUpdated.getDate() - 1);

  function onlyType(resource: fhir4.Resource) {
    return resource.resourceType === resourceType;
  }
  let references: fhir4.Resource[] = []

  const fhirResponse = await getFhirResourcesSince(lastUpdated, resourceType);
  let fhirResources: fhir4.Resource[] = fhirResponse.data.entry?.map((entry: any) => entry.resource) || [];
  references = references.concat(fhirResources.filter((resource) => !onlyType(resource)));
  fhirResources = fhirResources.filter(onlyType);

  const openMRSResponse = await getOpenMRSResourcesSince(lastUpdated, resourceType);
  let openMRSResources: fhir4.Resource[] = openMRSResponse.data.entry?.map((entry: any) => entry.resource) || [];
  references = references.concat(openMRSResources.filter((resource) => !onlyType(resource)));
  openMRSResources = openMRSResources.filter(onlyType);

  return { fhirResources: fhirResources, openMRSResources: openMRSResources, references: references };
}

interface ComparisonResult {
  toupdate: fhir4.Resource[],
  incoming: fhir4.Resource[],
  outgoing: fhir4.Resource[],
  references: fhir4.Resource[]
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
  const comparison = await getResources(resourceType);

  const results: ComparisonResult = {
    toupdate: [],
    incoming: [],
    outgoing: [],
    references: comparison.references
  }

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

const getEncounterKey = (encounter: any) => { return getIdType(encounter, openMRSIdentifierType) || encounter.id };

async function sendEncounterToOpenMRS(
  encounter: fhir4.Encounter,
  patient: fhir4.Patient,
  observations: fhir4.Observation[]
) {
  const patientId = getIdType(patient, openMRSIdentifierType);
  const openMRSVisit = buildOpenMRSVisit(patientId, encounter);
  const visitResponse = await createOpenMRSResource(openMRSVisit[0]);
  if (visitResponse.status == 200 || visitResponse.status == 201) {
    const visitNoteResponse = await createOpenMRSResource(openMRSVisit[1]);
    if (visitNoteResponse.status == 200 || visitNoteResponse.status == 201) {
      const visitNote = visitNoteResponse.data as fhir4.Encounter;
      // save openmrs id on orignal encounter
      copyIdToNamedIdentifier(visitNote, encounter, openMRSIdentifierType);
      updateFhirResource(encounter);
      observations.forEach((observation) => {
        const openMRSObservation = buildOpenMRSObservation(observation, patientId, visitNote.id || '');
        createOpenMRSResource(openMRSObservation);
      });
    }
  }
}

async function sendEncounterToFhir(
  encounter: fhir4.Encounter,
  patient: fhir4.Patient,
  observations: fhir4.Observation[]
) {
  copyIdToNamedIdentifier(encounter, encounter, openMRSIdentifierType);
  replaceReference(encounter, 'subject', patient);
  const response = await updateFhirResource(encounter);
  observations.forEach((observation) => {
    replaceReference(observation, 'subject', patient);
    createFhirResource(observation);
  });
}

/*
  Sync Encounters and Observations
  For incoming encounters, saves them to FHIR Server, then gathers related Observations
  And send to CHT the Encounter together with its observations
  For outgoing, converts to OpenMRS format and sends to OpenMRS
  Updates to Observations and Encounters are not allowed
*/
export async function syncEncounters(){
  const encounters: ComparisonResult = await compare(getEncounterKey, 'Encounter');

  function getPatient(encounter: fhir4.Encounter): fhir4.Patient {
    return encounters.references.filter((resource) => {
      return resource.resourceType === 'Patient' && `Patient/${resource.id}` === encounter.subject?.reference
    })[0] as fhir4.Patient;
  }

  function getObservations(encounter: fhir4.Encounter): fhir4.Observation[] {
    return encounters.references.filter((resource) => {
      if (resource.resourceType === 'Observation') {
        const observation = resource as fhir4.Observation;
         return observation.encounter?.reference === `Encounter/${encounter.id}`
      } else {
        return false;
      }
    }) as fhir4.Observation[];
  }

  encounters.incoming.forEach(async (openMRSResource) => {
    const encounter = openMRSResource as fhir4.Encounter;
    const patient = getPatient(encounter);
    if (patient && patient.id) {
      const observations = getObservations(encounter);
      const patientResponse = await getFHIRPatientResource(patient.id);
      if (patientResponse.status == 200 || patientResponse.status == 201) {
        const existingPatient = patientResponse.data?.entry[0];
        sendEncounterToFhir(encounter, existingPatient, observations);
        chtRecordFromObservations(existingPatient.id, observations);
      }
    }
  });

  encounters.outgoing.forEach(async (openMRSResource) => {
    const encounter = openMRSResource as fhir4.Encounter;
    const patient = getPatient(encounter);
    const observations = getObservations(encounter);
    sendEncounterToOpenMRS(encounter, patient, observations);
  });
}
