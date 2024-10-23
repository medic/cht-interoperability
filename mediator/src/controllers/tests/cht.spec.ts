import {
  createPatient,
  updatePatientIds,
  createEncounter
} from '../cht'
import {
  ChtPatientFactory,
  ChtSMSPatientFactory,
  ChtPatientIdsFactory,
  ChtPregnancyForm
} from '../../middlewares/schemas/tests/cht-request-factories';
import {
  PatientFactory,
  EncounterFactory,
  ObservationFactory
} from '../../middlewares/schemas/tests/fhir-resource-factories';
import {
  chtDocumentIdentifierType,
  chtPatientIdentifierType
} from '../../mappers/cht';

import * as fhir from '../../utils/fhir';
import * as cht from '../../utils/cht';

import axios from 'axios';
import { randomUUID } from 'crypto';

jest.mock('axios');

describe('CHT outgoing document controllers', () => {
  describe('createPatient', () => {
    it('creates a FHIR Patient from CHT patient doc', async () => {
      jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
        data: {},
        status: 200,
      });

      const data = ChtPatientFactory.build();

      const res = await createPatient(data);

      expect(res.status).toBe(200);

      // assert that the create resource has the right identifier and type
      expect(fhir.updateFhirResource).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'Patient',
          identifier: expect.arrayContaining([
            expect.objectContaining({
              type: chtDocumentIdentifierType,
              value: data.doc._id
            })
          ]),
        })
      );
    });

    it('creates a FHIR Patient from an SMS form using source id', async () => {
      jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
        data: {},
        status: 200,
      });

      let sourceId = randomUUID();
      jest.spyOn(cht, 'getPatientUUIDFromSourceId').mockResolvedValueOnce(sourceId);

      const data = ChtSMSPatientFactory.build();

      const res = await createPatient(data);

      expect(res.status).toBe(200);

      // assert that the createid resource has the right identifier and type
      expect(fhir.updateFhirResource).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'Patient',
          identifier: expect.arrayContaining([
            expect.objectContaining({
              type: chtDocumentIdentifierType,
              value: sourceId
            })
          ]),
        })
      );
    });
  });

  describe('updatePatientIds', () => {
    it('updates patient ids', async () => {
      const existingPatient = PatientFactory.build();
      jest.spyOn(fhir, 'getFHIRPatientResource').mockResolvedValue({
        data: { total: 1, entry: [ { resource: existingPatient } ] },
        status: 200,
      });
      jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
        data: {},
        status: 200,
      });

      let sourceId = randomUUID();
      jest.spyOn(cht, 'getPatientUUIDFromSourceId').mockResolvedValueOnce(sourceId);

      const data = ChtPatientIdsFactory.build();

      const res = await updatePatientIds(data);

      expect(res.status).toBe(200);

      // assert that the created resource has the right identifier and type
      expect(fhir.updateFhirResource).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingPatient.id,
          identifier: expect.arrayContaining([
            expect.objectContaining({
              type: chtDocumentIdentifierType,
              value: sourceId
            })
          ]),
        })
      );
    });
  });

  describe('createEncounter', () => {
    it('creates FHIR Encounter from CHT form', async () => {
      jest.spyOn(fhir, 'getFHIRPatientResource').mockResolvedValueOnce({
        data: { total: 1, entry: [ { resource: PatientFactory.build() } ] },
        status: 200,
      });
      // observations use createFhirResource
      jest.spyOn(fhir, 'createFhirResource').mockResolvedValueOnce({
        data: {},
        status: 200,
      });
      // encounter uses updatedFhirResource
      jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
        data: {},
        status: 200,
      });

      const data = ChtPregnancyForm.build();

      const res = await createEncounter(data);

      expect(res.status).toBe(200);

      // assert that the encounter was created
      expect(fhir.updateFhirResource).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'Encounter',
          identifier: expect.arrayContaining([
            expect.objectContaining({
              type: chtDocumentIdentifierType,
              value: data.id
            })
          ]),
        })
      );

      // assert that at least one observation was created with the right codes
      expect(fhir.createFhirResource).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'Observation',
          code: {
            coding: expect.arrayContaining([{
              code: data.observations[0].code
            }])
          },
          valueCodeableConcept: {
            coding: expect.arrayContaining([{
              code: data.observations[0].valueCode
            }])
          }
        })
      );
    });
  });
});
