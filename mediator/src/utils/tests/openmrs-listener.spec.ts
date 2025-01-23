import { addListeners, removeListeners } from '../openmrs-listener';
import { chtEventEmitter, CHT_EVENTS } from '../cht';
import * as openmrsSync from '../openmrs_sync';
import { logger } from '../../../logger';
import { PatientFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';

jest.mock('../../../logger');
jest.mock('../openmrs_sync');

describe('OpenMRS Listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addListeners', () => {
    it('registers patient and encounter listeners', () => {
      const spyOn = jest.spyOn(chtEventEmitter, 'on');

      addListeners();

      expect(spyOn).toHaveBeenCalledWith(CHT_EVENTS.PATIENT_CREATED, expect.any(Function));
      expect(spyOn).toHaveBeenCalledWith(CHT_EVENTS.ENCOUNTER_CREATED, expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith('OpenMRS listeners added successfully');
    });

    it('does not register duplicate listeners', () => {
      // First call should register both listeners
      addListeners();

      // Reset the spy after first registration
      const spyOn = jest.spyOn(chtEventEmitter, 'on');

      // Second call should not register new listeners
      addListeners();

      // Expect no new listeners to be registered
      expect(spyOn).not.toHaveBeenCalled();
    });
  });

  describe('removeListeners', () => {
    it('deregisters patient and encounter listeners', () => {
      const spyOff = jest.spyOn(chtEventEmitter, 'off');

      addListeners();
      removeListeners();

      expect(spyOff).toHaveBeenCalledWith(CHT_EVENTS.PATIENT_CREATED, expect.any(Function));
      expect(spyOff).toHaveBeenCalledWith(CHT_EVENTS.ENCOUNTER_CREATED, expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith('OpenMRS listeners removed successfully');
    });
  });

  describe('Patient Listener', () => {
    it('sends patient to OpenMRS when patient created event is emitted', async () => {
      const patient = PatientFactory.build();
      const sendPatientSpy = jest.spyOn(openmrsSync, 'sendPatientToOpenMRS');

      addListeners();
      await chtEventEmitter.emit(CHT_EVENTS.PATIENT_CREATED, patient);

      expect(sendPatientSpy).toHaveBeenCalledWith(patient);
    });
  });

  describe('Encounter Listener', () => {
    it('sends encounter to OpenMRS when encounter created event is emitted', async () => {
      const encounter = { id: '123', resourceType: 'Encounter' };
      const references = [{ id: '456', resourceType: 'Patient' }];
      const sendEncounterSpy = jest.spyOn(openmrsSync, 'sendEncounterToOpenMRS');

      addListeners();
      await chtEventEmitter.emit(CHT_EVENTS.ENCOUNTER_CREATED, { encounter, references });

      expect(sendEncounterSpy).toHaveBeenCalledWith(encounter, references);
    });
  });
});
