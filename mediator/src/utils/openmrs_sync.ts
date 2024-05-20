import { getFhirResourcesSince, updateFhirResource, getIdType } from './fhir'
import { getOpenMRSResourcesSince, createOpenMRSResource } from './openmrs'
import { buildOpenMRSPatient, buildOpenMRSVisit, buildOpenMRSObservation } from '../mappers/openmrs'
import { openMRSIdentifierType } from '../mappers/openmrs'
import { createChtPatient, chtRecordFromObservations } from './cht'

interface ComparisonResult {
  fhirResources: fhir4.Resource[],
  openMRSResources: fhir4.Resource[]
}

async function getResources(resourceType: string): Promise<ComparisonResult> {
  var lastUpdated = new Date();
  lastUpdated.setDate(lastUpdated.getDate() - 1);

  const fhirResponse = await getFhirResourcesSince(lastUpdated, resourceType);
  const fhirResources: fhir4.Resource[] = fhirResponse.data.entry || [];

  const openMRSResponse = await getOpenMRSResourcesSince(lastUpdated, resourceType);
  const openMRSResources: fhir4.Resource[] = openMRSResponse.data.entry || [];

  return { fhirResources: fhirResources, openMRSResources: openMRSResources };
}

interface SyncResults {
  toupdate: fhir4.Resource[],
  incoming: fhir4.Resource[],
  outgoing: fhir4.Resource[]
}

async function sync(
  getKey: (resource: any) => string,
  resourceType: string
): Promise<SyncResults> {
  const results: SyncResults = {
    toupdate: [],
    incoming: [],
    outgoing: []
  }

  const comparison = await getResources(resourceType);
  // get the key for each resource and create a Map
  const fhirIds = new Map(comparison.fhirResources.map(resource => [getKey(resource), resource]));

  comparison.openMRSResources.forEach((openMRSResource) => {
    if (fhirIds.has(getKey(openMRSResource))) {
      // ok so the fhir server already has it
      results.toupdate.push(openMRSResource);
      fhirIds.delete(getKey(openMRSResource));
    } else {
      results.incoming.push(openMRSResource);
    }
  });

  fhirIds.forEach((resource, key) => {
    results.outgoing.push(resource);
  });

  return results;
}

export async function syncPatients(){
  const getKey = (fhirPatient: any) => { return getIdType(fhirPatient, openMRSIdentifierType) || fhirPatient.id };
  const results: SyncResults = await sync(getKey, 'Patient');

  results.incoming.forEach(async (openMRSResource) => {
    const response = await updateFhirResource(openMRSResource);
    const response2 = await createChtPatient( response.data );
  });

  /*
  results.toupdate.forEach(async (openMRSResource) => {
    const chtDocId = openMRSPatient.getIdType(chtIdentifierType)
    if (! chtDocId ){
      const response = await updateOpenMRSResource({ ...openMRSResource, resourceType: 'Patient' });
    }
  });
  */

  results.outgoing.forEach(async (openMRSResource) => {
    const patient = openMRSResource as fhir4.Patient;
    const openMRSPatient = buildOpenMRSPatient(patient);
    const response = await createOpenMRSResource(openMRSPatient);
  });
}

export async function syncEncountersAndObservations(){
  const getEncounterKey = (fhirEncounter: any) => { return JSON.stringify(fhirEncounter.period); };
  const encounters: SyncResults = await sync(getEncounterKey, 'Encounter');
  const getObservationKey = (fhirObservation: any) => {
    return fhirObservation.effectiveDateTime + fhirObservation.code.coding[0].code;
  };
  const observations: SyncResults = await sync(getObservationKey, 'Observation');

  const encountersToCht = new Map();
  // create encounters and observations in the fhir server
  encounters.incoming.forEach(async (openMRSResource) => {
    const response = await updateFhirResource(openMRSResource);

    // save to map to push to cht later
    encountersToCht.set(openMRSResource.id, {
      observations: [],
      encounter: openMRSResource
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

  encounters.outgoing.forEach(async (openMRSResource) => {
    const encounter = openMRSResource as fhir4.Encounter;
    const openMRSVisit = buildOpenMRSVisit(encounter);
    const response = await createOpenMRSResource(openMRSVisit[0]);
    const response2 = await createOpenMRSResource(openMRSVisit[1]);
  });
  observations.outgoing.forEach(async (openMRSResource) => {
    const response = await createOpenMRSResource(openMRSResource);
  });

  encountersToCht.forEach(async (key: string, value: any) => {
    const patientId = value.encounter.subject.reference.split('/')[1];
    const response = await chtRecordFromObservations(patientId, value.observations);
  });
}
