import { chtEventEmitter, CHT_EVENTS } from './cht';
import { sendPatientToOpenMRS, sendEncounterToOpenMRS } from './openmrs_sync';
import { logger } from '../../logger';

// Store active listeners to allow for deregistration
type PatientListener = (patient: fhir4.Patient) => Promise<void>;
type EncounterListener = (data: { encounter: fhir4.Encounter, references: fhir4.Resource[] }) => Promise<void>;
const activeListeners: { [key: string]: PatientListener | EncounterListener } = {};

function registerPatientListener() {
  if (activeListeners[CHT_EVENTS.PATIENT_CREATED]) {
    return; // Already registered
  }
  const listener = async (patient: fhir4.Patient) => {
    try {
      await sendPatientToOpenMRS(patient);
    } catch (error) {
      logger.error(`Error sending patient to OpenMRS: ${error}`);
    }
  };
  chtEventEmitter.on(CHT_EVENTS.PATIENT_CREATED, listener);
  activeListeners[CHT_EVENTS.PATIENT_CREATED] = listener;
  logger.info('Patient listener registered');
}

function registerEncounterListener() {
  if (activeListeners[CHT_EVENTS.ENCOUNTER_CREATED]) {
    return; // Already registered
  }
  const listener = async (data: {
    encounter: fhir4.Encounter,
    references: fhir4.Resource[]
  }) => {
    try {
      await sendEncounterToOpenMRS(data.encounter, data.references);
    } catch (error) {
      logger.error(`Error sending encounter to OpenMRS: ${error}`);
    }
  };
  chtEventEmitter.on(CHT_EVENTS.ENCOUNTER_CREATED, listener);
  activeListeners[CHT_EVENTS.ENCOUNTER_CREATED] = listener;
  logger.info('Encounter listener registered');
}

function deregisterListener(eventName: string) {
  if (activeListeners[eventName]) {
    chtEventEmitter.off(eventName, activeListeners[eventName]);
    delete activeListeners[eventName];
    logger.info(`Deregistered listener for ${eventName}`);
  }
}

export function addListeners() {
  registerPatientListener();
  registerEncounterListener();
  logger.info('OpenMRS listeners added successfully');
}

export function removeListeners() {
  deregisterListener(CHT_EVENTS.PATIENT_CREATED);
  deregisterListener(CHT_EVENTS.ENCOUNTER_CREATED);
  logger.info('OpenMRS listeners removed successfully');
}
