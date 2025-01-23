import { jest } from '@jest/globals';
import * as chtModule from '../cht';
import * as openmrsSyncModule from '../openmrs_sync';
import * as fhirModule from '../fhir';
import { FHIR } from '../../../config';
import { registerOpenMRSListeners } from '../openmrs-listener';

jest.mock('../cht', () => ({
  chtEventEmitter: {
    on: jest.fn(),
    off: jest.fn(),
  },
  CHT_EVENTS: {
    PATIENT_CREATED: 'patient:created',
    ENCOUNTER_CREATED: 'encounter:created',
  },
}));

jest.mock('../openmrs_sync', () => ({
  sendPatientToOpenMRS: jest.fn(),
  sendEncounterToOpenMRS: jest.fn(),
}));

jest.mock('../fhir', () => ({
  createSubscription: jest.fn(),
  fhirEventEmitter: {
    on: jest.fn(),
    emit: jest.fn(),
  },
}));

describe('OpenMRS Listener', () => {
  const mockChtEventEmitter = chtModule.chtEventEmitter as jest.Mocked<typeof chtModule.chtEventEmitter>;
  const mockFhirEventEmitter = fhirModule.fhirEventEmitter as jest.Mocked<typeof fhirModule.fhirEventEmitter>;
  const mockSendPatientToOpenMRS = openmrsSyncModule.sendPatientToOpenMRS as jest.MockedFunction<typeof openmrsSyncModule.sendPatientToOpenMRS>;
  const mockSendEncounterToOpenMRS = openmrsSyncModule.sendEncounterToOpenMRS as jest.MockedFunction<typeof openmrsSyncModule.sendEncounterToOpenMRS>;
  const mockCreateSubscription = fhirModule.createSubscription as jest.MockedFunction<typeof fhirModule.createSubscription>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerOpenMRSListeners', () => {
    it('should create subscriptions for patients and encounters', async () => {
      await registerOpenMRSListeners();

      expect(mockCreateSubscription).toHaveBeenCalledTimes(2);
      expect(mockCreateSubscription).toHaveBeenCalledWith(
        'Patient',
        `${FHIR.url}/Patient/_history`,
        ['Content-Type: application/fhir+json']
      );
      expect(mockCreateSubscription).toHaveBeenCalledWith(
        'Encounter',
        `${FHIR.url}/Encounter/_history`,
        ['Content-Type: application/fhir+json']
      );
    });

    it('should handle subscription creation errors gracefully', async () => {
      mockCreateSubscription.mockRejectedValueOnce(new Error('Network error'));

      await expect(registerOpenMRSListeners()).resolves.not.toThrow();
    });
  });

  describe('subscription event handlers', () => {
    let resourceCreatedHandler: (resource: fhir4.Resource) => void;
    let resourceUpdatedHandler: (resource: fhir4.Resource) => void;

    beforeEach(() => {
      // Capture the event handlers
      const calls = (mockFhirEventEmitter.on as jest.Mock).mock.calls;
      const createdCall = calls.find(call => call[0] === 'resourceCreated');
      const updatedCall = calls.find(call => call[0] === 'resourceUpdated');
      
      if (!createdCall?.[1] || !updatedCall?.[1]) {
        throw new Error('Event handlers not properly registered');
      }
      
      resourceCreatedHandler = createdCall[1] as (resource: fhir4.Resource) => void;
      resourceUpdatedHandler = updatedCall[1] as (resource: fhir4.Resource) => void;
    });

    it('should register patient listener when patient subscription is created', () => {
      const subscription: fhir4.Subscription = {
        resourceType: 'Subscription',
        status: 'active',
        reason: 'Test subscription',
        criteria: 'Patient',
        channel: {
          type: 'rest-hook',
          endpoint: 'test-endpoint'
        }
      };

      resourceCreatedHandler(subscription);

      expect(mockChtEventEmitter.on).toHaveBeenCalledWith(
        chtModule.CHT_EVENTS.PATIENT_CREATED,
        expect.any(Function)
      );
    });

    it('should register encounter listener when encounter subscription is created', () => {
      const subscription: fhir4.Subscription = {
        resourceType: 'Subscription',
        status: 'active',
        reason: 'Test subscription',
        criteria: 'Encounter',
        channel: {
          type: 'rest-hook',
          endpoint: 'test-endpoint'
        }
      };

      resourceCreatedHandler(subscription);

      expect(mockChtEventEmitter.on).toHaveBeenCalledWith(
        chtModule.CHT_EVENTS.ENCOUNTER_CREATED,
        expect.any(Function)
      );
    });

    it('should deregister patient listener when patient subscription is deactivated', () => {
      const subscription: fhir4.Subscription = {
        resourceType: 'Subscription',
        status: 'off',
        reason: 'Test subscription',
        criteria: 'Patient',
        channel: {
          type: 'rest-hook',
          endpoint: 'test-endpoint'
        }
      };

      resourceUpdatedHandler(subscription);

      expect(mockChtEventEmitter.off).toHaveBeenCalledWith(
        chtModule.CHT_EVENTS.PATIENT_CREATED,
        expect.any(Function)
      );
    });

    it('should deregister encounter listener when encounter subscription is deactivated', () => {
      const subscription: fhir4.Subscription = {
        resourceType: 'Subscription',
        status: 'off',
        reason: 'Test subscription',
        criteria: 'Encounter',
        channel: {
          type: 'rest-hook',
          endpoint: 'test-endpoint'
        }
      };

      resourceUpdatedHandler(subscription);

      expect(mockChtEventEmitter.off).toHaveBeenCalledWith(
        chtModule.CHT_EVENTS.ENCOUNTER_CREATED,
        expect.any(Function)
      );
    });
  });

  describe('event handling', () => {
    let patientListener: (patient: fhir4.Patient) => Promise<void>;
    let encounterListener: (data: { encounter: fhir4.Encounter, references: fhir4.Resource[] }) => Promise<void>;

    beforeEach(() => {
      // Register listeners
      const subscription: fhir4.Subscription = {
        resourceType: 'Subscription',
        status: 'active',
        reason: 'Test subscription',
        criteria: 'Patient',
        channel: {
          type: 'rest-hook',
          endpoint: 'test-endpoint'
        }
      };

      const encounterSubscription: fhir4.Subscription = {
        resourceType: 'Subscription',
        status: 'active',
        reason: 'Test subscription',
        criteria: 'Encounter',
        channel: {
          type: 'rest-hook',
          endpoint: 'test-endpoint'
        }
      };

      // Get the resourceCreated handler and call it to register listeners
      const calls = (mockFhirEventEmitter.on as jest.Mock).mock.calls;
      const createdCall = calls.find(call => call[0] === 'resourceCreated');
      
      if (!createdCall?.[1]) {
        throw new Error('Resource created handler not properly registered');
      }

      const handler = createdCall[1] as (resource: fhir4.Resource) => void;
      handler(subscription);
      handler(encounterSubscription);

      // Capture the registered listeners
      const patientCall = (mockChtEventEmitter.on as jest.Mock).mock.calls
        .find(call => call[0] === chtModule.CHT_EVENTS.PATIENT_CREATED);
      const encounterCall = (mockChtEventEmitter.on as jest.Mock).mock.calls
        .find(call => call[0] === chtModule.CHT_EVENTS.ENCOUNTER_CREATED);

      if (!patientCall?.[1] || !encounterCall?.[1]) {
        throw new Error('Event listeners not properly registered');
      }

      patientListener = patientCall[1] as (patient: fhir4.Patient) => Promise<void>;
      encounterListener = encounterCall[1] as (data: { encounter: fhir4.Encounter, references: fhir4.Resource[] }) => Promise<void>;
    });

    it('should send patient to OpenMRS when patient event is emitted', async () => {
      const mockPatient: fhir4.Patient = {
        resourceType: 'Patient',
        id: 'test-patient'
      };

      await patientListener(mockPatient);

      expect(mockSendPatientToOpenMRS).toHaveBeenCalledWith(mockPatient);
    });

    it('should handle patient sync errors gracefully', async () => {
      const mockPatient: fhir4.Patient = {
        resourceType: 'Patient',
        id: 'test-patient'
      };

      mockSendPatientToOpenMRS.mockRejectedValueOnce(new Error('Sync error'));

      await expect(patientListener(mockPatient)).resolves.not.toThrow();
    });

    it('should send encounter to OpenMRS when encounter event is emitted', async () => {
      const mockEncounter: fhir4.Encounter = {
        resourceType: 'Encounter',
        id: 'test-encounter',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory'
        }
      };
      const mockReferences: fhir4.Resource[] = [];

      await encounterListener({ encounter: mockEncounter, references: mockReferences });

      expect(mockSendEncounterToOpenMRS).toHaveBeenCalledWith(mockEncounter, mockReferences);
    });

    it('should handle encounter sync errors gracefully', async () => {
      const mockEncounter: fhir4.Encounter = {
        resourceType: 'Encounter',
        id: 'test-encounter',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory'
        }
      };
      const mockReferences: fhir4.Resource[] = [];

      mockSendEncounterToOpenMRS.mockRejectedValueOnce(new Error('Sync error'));

      await expect(encounterListener({ encounter: mockEncounter, references: mockReferences })).resolves.not.toThrow();
    });
  });
});
