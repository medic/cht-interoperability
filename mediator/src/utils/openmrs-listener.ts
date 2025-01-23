import { chtEventEmitter, CHT_EVENTS } from './cht';
import { sendPatientToOpenMRS, sendEncounterToOpenMRS } from './openmrs_sync';
import { logger } from '../../logger';
import { createSubscription, fhirEventEmitter } from './fhir';
import { OPENMRS } from '../../config';

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

function handleActiveSubscription(subscription: fhir4.Subscription) {
  if (subscription.criteria.startsWith('Patient')) {
    registerPatientListener();
  } else if (subscription.criteria.startsWith('Encounter')) {
    registerEncounterListener();
  }
}

// Handle subscription status changes
fhirEventEmitter.on('resourceCreated', (resource: fhir4.Resource) => {
  if (resource.resourceType === 'Subscription' && (resource as fhir4.Subscription).status === 'active') {
    handleActiveSubscription(resource as fhir4.Subscription);
  }
});

fhirEventEmitter.on('resourceUpdated', (resource: fhir4.Resource) => {
  if (resource.resourceType === 'Subscription') {
    const subscription = resource as fhir4.Subscription;
    if (subscription.status === 'active') {
      handleActiveSubscription(subscription);
    } else {
      if (subscription.criteria.startsWith('Patient')) {
        deregisterListener(CHT_EVENTS.PATIENT_CREATED);
      } else if (subscription.criteria.startsWith('Encounter')) {
        deregisterListener(CHT_EVENTS.ENCOUNTER_CREATED);
      }
    }
  }
});

export async function registerOpenMRSListeners() {
  try {
    // Create subscriptions for patient and encounter events
    await createSubscription(
      'Patient?',
      `${OPENMRS.url}/Patient/`,
      ['Content-Type: application/fhir+json']
    );
    
    await createSubscription(
      'Encounter',
      `${OPENMRS.url}/Encounter/`,
      ['Content-Type: application/fhir+json']
    );

    logger.info('OpenMRS FHIR subscriptions created successfully');
  } catch (error) {
    logger.error('Error creating OpenMRS FHIR subscriptions:', error);
  }
}
