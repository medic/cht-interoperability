import {
  getFhirResourcesSince,
  updateFhirResource,
  createFhirResource,
  getIdType,
  addId,
  copyIdToNamedIdentifier,
  getFhirResource,
  replaceReference,
  getFHIRPatientResource,
  addSourceMeta
} from './fhir'
import { SYNC_INTERVAL } from '../../config'
import { getOpenMRSResourcesSince, createOpenMRSResource } from './openmrs'
import { buildOpenMRSPatient, buildOpenMRSVisit, buildOpenMRSObservation, openMRSIdentifierType, openMRSSource } from '../mappers/openmrs'
import { chtDocumentIdentifierType, chtSource } from '../mappers/cht'
import { createChtPatient, chtRecordFromObservations } from './cht'
import { logger } from '../../logger';

interface ComparisonResources {
  fhirResources: fhir4.Resource[],
  openMRSResources: fhir4.Resource[],
  references: fhir4.Resource[]
}

/*
  Get resources updates in the last day from both OpenMRS and the FHIR server
*/
async function getResources(resourceType: string, startTime: Date): Promise<ComparisonResources> {
  function onlyType(resource: fhir4.Resource) {
    return resource.resourceType === resourceType;
  }
  let references: fhir4.Resource[] = []

  const fhirResponse = await getFhirResourcesSince(startTime, resourceType);
  if (fhirResponse.status != 200) {
    throw new Error(`Error ${fhirResponse.status} when requesting FHIR resources`);
  }
  const fhirResources = fhirResponse.data.filter(onlyType);
  references = references.concat(fhirResponse.data);

  const openMRSResponse = await getOpenMRSResourcesSince(startTime, resourceType);
  if (openMRSResponse.status != 200) {
    throw new Error(`Error ${openMRSResponse.status} when requesting OpenMRS resources`);
  }
  const openMRSResources = openMRSResponse.data.filter(onlyType);
  references = references.concat(openMRSResponse.data);

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
  resourceType: string,
  startTime: Date,
): Promise<ComparisonResult> {
  const comparison = await getResources(resourceType, startTime);

  const results: ComparisonResult = {
    toupdate: [],
    incoming: [],
    outgoing: [],
    references: comparison.references
  };

  // get the key for each resource and create a Map
  const fhirIds = new Map(comparison.fhirResources.map(resource => [getKey(resource), resource]));

  comparison.openMRSResources.forEach((openMRSResource) => {
    const key = getKey(openMRSResource);
    if (fhirIds.has(key)) {
      // ok so the fhir server already has it
      results.toupdate.push(openMRSResource);
      fhirIds.delete(key);
    } else {
      const lastUpdated = new Date(openMRSResource.meta?.lastUpdated!);
      if (isNaN(lastUpdated.getTime()) || isNaN(startTime.getTime())) {
        throw new Error("Invalid date format");
      }
      const diff = lastUpdated.getTime() - startTime.getTime();
      if (diff > (Number(SYNC_INTERVAL) * 2)){
        results.incoming.push(openMRSResource);
      }
    }
  });

  fhirIds.forEach((resource, key) => {
    const lastUpdated = new Date(resource.meta?.lastUpdated || '');
    if (isNaN(lastUpdated.getTime()) || isNaN(startTime.getTime())) {
      throw new Error("Invalid date format");
    }
    const diff = lastUpdated.getTime() - startTime.getTime();
    if (diff > (Number(SYNC_INTERVAL) * 2)){
      results.outgoing.push(resource);
    }
  });

  logger.info(`Comparing ${resourceType}`);
  logger.info(`Incoming: ${results.incoming.map(r => r.id)}`);
  logger.info(`Outgoing: ${results.outgoing.map(r => r.id)}`);
  return results;
}

/*
  Send a patient from OpenMRS in the FHIR server
  And forward to CHT if successful
*/
async function sendPatientToFhir(patient: fhir4.Patient) {
  logger.info(`Sending Patient ${patient.id} to FHIR`);
  copyIdToNamedIdentifier(patient, patient, openMRSIdentifierType);
  addSourceMeta(patient, openMRSSource);
  const response = await updateFhirResource(patient);
  if (response.status == 200 || response.status == 201) {
    logger.info(`Sending Patient ${patient.id} to CHT`);
    createChtPatient(response.data);
  }
}

/*
  Send a patient from CHT to OpenMRS
  And update OpenMRS Id if successful
*/
async function sendPatientToOpenMRS(patient: fhir4.Patient) {
  logger.info(`Sending Patient ${patient.id} to OpenMRS`);
  const openMRSPatient = buildOpenMRSPatient(patient);
  addSourceMeta(openMRSPatient, chtSource);
  const response = await createOpenMRSResource(openMRSPatient);
  // copy openmrs identifier if successful
  if (response.status == 200 || response.status == 201) {
    copyIdToNamedIdentifier(response.data, patient, openMRSIdentifierType);
    logger.info(`Updating Patient ${patient.id} with openMRSId ${response.data.id}`);
    await updateFhirResource(patient);
  }
}
/*
  Sync Patients between OpenMRS and FHIR
  compare patient resources
  for incoming, creates them in the FHIR server and forwars to CHT
  for outgoing, sends them to OpenMRS, receives the ID back, and updates the ID
*/
export async function syncPatients(startTime: Date){
  const getKey = (fhirPatient: any) => { return getIdType(fhirPatient, openMRSIdentifierType) || fhirPatient.id };
  const results: ComparisonResult = await compare(getKey, 'Patient', startTime);

  const incomingPromises = results.incoming.map(async (resource) => {
    const patient = resource as fhir4.Patient;
    return sendPatientToFhir(patient);
  });
  const outgoingPromises = results.outgoing.map(async (resource) => {
    const patient = resource as fhir4.Patient;
    return sendPatientToOpenMRS(patient);
  });

  await Promise.all([...incomingPromises, ...outgoingPromises]);
}

/*
  Get a patient from a list of resources, by an encounters subject reference
*/
function getPatient(encounter: fhir4.Encounter, references: fhir4.Resource[]): fhir4.Patient {
  return references.filter((resource) => {
    return resource.resourceType === 'Patient' && `Patient/${resource.id}` === encounter.subject?.reference
  })[0] as fhir4.Patient;
}

/*
  Get a list of observations from a list of resources
  where the observations encounter reference is the encounter
*/
function getObservations(encounter: fhir4.Encounter, references: fhir4.Resource[]): fhir4.Observation[] {
  return references.filter((resource) => {
    if (resource.resourceType === 'Observation') {
      const observation = resource as fhir4.Observation;
       return observation.encounter?.reference === `Encounter/${encounter.id}`
    } else {
      return false;
    }
  }) as fhir4.Observation[];
}

/*
  Send an encounter from CHT to OpenMRS
  Saves both a Visit and VisitNote Encounter
  Updates the OpenMRS Id on the CHT encounter to the VisitNote
  Sends Observations for the visitNote Encounter 
*/
async function sendEncounterToOpenMRS(
  encounter: fhir4.Encounter,
  references: fhir4.Resource[]
) {
  if (encounter.meta?.source == openMRSSource) {
    logger.error(`Not re-sending encounter from openMRS ${encounter.id}`);
    return
  }

  logger.info(`Sending Encounter ${encounter.id} to OpenMRS`);
  const patient = getPatient(encounter, references);
  const observations = getObservations(encounter, references);
  const patientId = getIdType(patient, openMRSIdentifierType);
  const openMRSVisit = buildOpenMRSVisit(patientId, encounter);
  const visitResponse = await createOpenMRSResource(openMRSVisit[0]);
  if (visitResponse.status == 200 || visitResponse.status == 201) {
    const visitNoteResponse = await createOpenMRSResource(openMRSVisit[1]);
    if (visitNoteResponse.status == 200 || visitNoteResponse.status == 201) {
      const visitNote = visitNoteResponse.data as fhir4.Encounter;
      // save openmrs id on orignal encounter
      logger.info(`Updating Encounter ${patient.id} with openMRSId ${visitNote.id}`);
      copyIdToNamedIdentifier(visitNote, encounter, openMRSIdentifierType);
      addSourceMeta(visitNote, chtSource);
      await updateFhirResource(encounter);
      observations.forEach((observation) => {
        logger.info(`Sending Observation ${observation.code!.coding![0]!.code} to OpenMRS`);
        const openMRSObservation = buildOpenMRSObservation(observation, patientId, visitNote.id || '');
        createOpenMRSResource(openMRSObservation);
      });
    }
  }
}

/*
  Send Observation from OpenMRS to FHIR
  Replacing the subject reference
*/
async function sendObservationToFhir(observation: fhir4.Observation, patient: fhir4.Patient) {
  logger.info(`Sending Observation ${observation.code!.coding![0]!.code} to FHIR`);
  replaceReference(observation, 'subject', patient);
  createFhirResource(observation);
}

/*
  Send an Encounter from OpenMRS to FHIR
  Replaces the subject reference with an existing patient id from FHIR
  If there are any observations, sends them to FHIR
  If this encounter matches a CHT form, gathers observations
  and sends them to CHT
*/
async function sendEncounterToFhir(
  encounter: fhir4.Encounter,
  references: fhir4.Resource[]
) {
  if (encounter.meta?.source == chtSource) {
    logger.error(`Not re-sending encounter from cht ${encounter.id}`);
    return
  }
  if (!encounter.period?.end) {
    logger.error(`Not sending encounter which is incomplete ${encounter.id}`);
    return 
  }
  
  logger.info(`Sending Encounter ${encounter.id} to FHIR`);
  const patient = getPatient(encounter, references);
  const observations = getObservations(encounter, references);
  if (patient && patient.id) {
    // get patient from FHIR to resolve reference
    const patientResponse = await getFHIRPatientResource(patient.id);
    if (patientResponse.status == 200 || patientResponse.status == 201) {
      const existingPatient = patientResponse.data?.entry[0].resource;
      copyIdToNamedIdentifier(encounter, encounter, openMRSIdentifierType);
      addSourceMeta(encounter, openMRSSource);

      logger.info(`Replacing ${encounter.subject!.reference} with ${patient.id} for ${encounter.id}`);
      replaceReference(encounter, 'subject', existingPatient);

      // remove unused references
      delete encounter.participant;
      delete encounter.location;

      const response = await updateFhirResource(encounter);
      if (response.status == 200 || response.status == 201) {
        observations.forEach(o => sendObservationToFhir(o, existingPatient));

        logger.info(`Sending Encounter ${encounter.id} to CHT`);
        const chtResponse = await chtRecordFromObservations(existingPatient.id, observations);
        if (chtResponse.status == 200) {
          const chtId = chtResponse.data.id;
          addId(encounter, chtDocumentIdentifierType, chtId)
          await updateFhirResource(encounter);
        }
      }
    }
  } else {
    logger.error(`Patient ${encounter.subject!.reference} not found for ${encounter.id}`);
  }
}

/*
  Sync Encounters and Observations
  For incoming encounters, saves them to FHIR Server, then gathers related Observations
  And send to CHT the Encounter together with its observations
  For outgoing, converts to OpenMRS format and sends to OpenMRS
  Updates to Observations and Encounters are not allowed
*/
export async function syncEncounters(startTime: Date){
  const getEncounterKey = (encounter: any) => { return getIdType(encounter, openMRSIdentifierType) || encounter.id };
  const encounters: ComparisonResult = await compare(getEncounterKey, 'Encounter', startTime);

  // for incoming encounters, save them in order so that references are saved before
  for (const resource of encounters.incoming) {
    const encounter = resource as fhir4.Encounter;
    await sendEncounterToFhir(encounter, encounters.references);
  };

  const outgoingPromises = encounters.outgoing.map(async (resource) => {
    const encounter = resource as fhir4.Encounter;
    return sendEncounterToOpenMRS(encounter, encounters.references)
  });

  await Promise.all(outgoingPromises);
}
