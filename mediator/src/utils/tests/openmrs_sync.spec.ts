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
    it('correctly identifies incoming, outgoing, and to-be-updated resources based on the given key', async () => {
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

    it('does not send outgoing Encounters to OpenMRS if identifier exists in FHIR', async () => {
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

      jest.spyOn(fhir, 'getFhirResourceByIdentifier').mockResolvedValue({
        data: { total: 1, entry: [ { resource: fhirEncounter } ] },
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

      expect(openmrs.createOpenMRSResource).not.toHaveBeenCalled();
    });
  });
});
