import {
  compare,
  syncPatients,
  syncEncounters,
  getPatient
} from '../openmrs_sync';
import * as fhir from '../fhir';
import * as openmrs from '../openmrs';
import * as cht from '../cht';

import { PatientFactory, EncounterFactory, ObservationFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';
import { visitType, visitNoteType } from '../../mappers/openmrs';
import { chtDocumentIdentifierType, chtPatientIdentifierType } from '../../mappers/cht';
import { getIdType } from '../../utils/fhir';

import axios from 'axios';
import { logger } from '../../../logger';
jest.mock('axios');
jest.mock('../../../logger');

describe('OpenMRS Sync', () => {
  describe('compare', () => {
    it('compares resources with the gvien key', async () => {
      const lastUpdated = new Date();
      lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

      const constants = {
        resourceType: 'Patient',
        meta: { lastUpdated: lastUpdated }
      }

      jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
        data: [
          { id: 'outgoing', ...constants },
          { id: 'toupdate', ...constants }
        ],
        status: 200,
      });
      jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
        data: [
          { id: 'incoming', ...constants },
          { id: 'toupdate', ...constants }
        ],
        status: 200,
      });

      const getKey = (obj: any) => { return obj.id };
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 1);
      const comparison = await compare(getKey, 'Patient', startTime)

      expect(comparison.incoming).toEqual([{id: 'incoming', ...constants }]);
      expect(comparison.outgoing).toEqual([{id: 'outgoing', ...constants }]);
      expect(comparison.toupdate).toEqual([{id: 'toupdate', ...constants }]);

      expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
      expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();
    });

    it('loads references for related resources', async () => {
      const lastUpdated = new Date();
      lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);
      const reference = {
         id: 'reference0',
         resourceType: 'Patient',
         meta: { lastUpdated: lastUpdated }
      };
      const resource = {
         id: 'resource0',
         resourceType: 'Encounter',
         meta: { lastUpdated: lastUpdated }
      };

      jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
        data: [ resource, reference ],
        status: 200,
      });
      jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
        data: [ resource ],
        status: 200,
      });

      const getKey = (obj: any) => { return obj.id };
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 1);
      const comparison = await compare(getKey, 'Encounter', startTime)

      expect(comparison.references).toContainEqual(reference);
      expect(comparison.toupdate).toEqual([resource]);

      expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
      expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();
    });
  });

  describe('syncPatients', () => {
    it('sends incoming Patients to FHIR and CHT', async () => {
      const lastUpdated = new Date();
      lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

      const openMRSPatient = PatientFactory.build();
      openMRSPatient.meta = { lastUpdated: lastUpdated };
      jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
        data: [],
        status: 200,
      });
      jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
        data: [openMRSPatient],
        status: 200,
      });
      jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
        data: openMRSPatient,
        status: 201
      });
      jest.spyOn(cht, 'createChtPatient')

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 1);
      const comparison = await syncPatients(startTime);

      expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
      expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

      expect(fhir.updateFhirResource).toHaveBeenCalledWith(openMRSPatient);
      expect(cht.createChtPatient).toHaveBeenCalledWith(openMRSPatient);
    });

    it('sends outgoing Patients to OpenMRS', async () => {
      const lastUpdated = new Date();
      lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

      const fhirPatient = PatientFactory.build();
      fhirPatient.meta = { lastUpdated: lastUpdated };

      jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
        data: [fhirPatient],
        status: 200,
      });
      jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
        data: [],
        status: 200,
      });
      jest.spyOn(openmrs, 'createOpenMRSResource').mockResolvedValueOnce({
        data: fhirPatient,
        status: 201
      });
      jest.spyOn(fhir, 'updateFhirResource')

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 1);
      const comparison = await syncPatients(startTime);

      expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
      expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

      expect(openmrs.createOpenMRSResource).toHaveBeenCalledWith(fhirPatient);
      // updating with openmrs id
      expect(fhir.updateFhirResource).toHaveBeenCalledWith(fhirPatient);
    });
  });
  describe('syncEncounters', () => {
    it('sends incoming Encounters to FHIR and CHT', async () => {
      const lastUpdated = new Date();
      lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

      const openMRSPatient = PatientFactory.build();
      openMRSPatient.meta = { lastUpdated: lastUpdated };
      const openMRSEncounter = EncounterFactory.build();
      openMRSEncounter.meta = { lastUpdated: lastUpdated };
      openMRSEncounter.subject = {
        reference: `Patient/${openMRSPatient.id}`
      };
      const openMRSObservation = ObservationFactory.build();
      openMRSObservation.encounter = { reference: 'Encounter/' + openMRSEncounter.id }

      jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
        data: [openMRSEncounter, openMRSPatient, openMRSObservation],
        status: 200,
      });

      jest.spyOn(fhir, 'getFHIRPatientResource').mockResolvedValueOnce({
        data: { entry: [{ resource: openMRSPatient }] },
        status: 200,
      });

      jest.spyOn(fhir, 'updateFhirResource').mockResolvedValue({
        data: [],
        status: 201,
      });

      jest.spyOn(fhir, 'createFhirResource')

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 1);
      const comparison = await syncEncounters(startTime);

      expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
      expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

      expect(fhir.updateFhirResource).toHaveBeenCalledWith(openMRSEncounter);
      expect(fhir.createFhirResource).toHaveBeenCalledWith(openMRSObservation);
    });

    it('sends outgoing Encounters to OpenMRS', async () => {
      const lastUpdated = new Date();
      lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

      const fhirEncounter = EncounterFactory.build();
      fhirEncounter.meta = { lastUpdated: lastUpdated };
      const fhirObservation = ObservationFactory.build();
      fhirObservation.encounter = { reference: 'Encounter/' + fhirEncounter.id }
      const chtDocId = {
        system: "cht",
        type: chtDocumentIdentifierType,
        value: getIdType(fhirEncounter, chtDocumentIdentifierType)
      }

      jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
        data: [fhirEncounter, fhirObservation],
        status: 200,
      });

      jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      jest.spyOn(openmrs, 'createOpenMRSResource').mockResolvedValue({
        data: [],
        status: 201,
      });

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 1);
      const comparison = await syncEncounters(startTime);

      expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
      expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

      expect(openmrs.createOpenMRSResource).toHaveBeenCalledWith(
        expect.objectContaining({
          "type": expect.arrayContaining([visitType]),
          "identifier": expect.arrayContaining([chtDocId])
        })
      );

      expect(openmrs.createOpenMRSResource).toHaveBeenCalledWith(
        expect.objectContaining({
          "type": expect.arrayContaining([visitNoteType]),
        })
      );

      expect(openmrs.createOpenMRSResource).toHaveBeenCalledWith(fhirObservation);
    });
  });
});
