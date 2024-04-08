import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { EncounterSchema } from '../middlewares/schemas/encounter';
import { createFhirResource, validateFhirResource, getFHIRPatientResource } from '../utils/fhir';
import { requestHandler } from '../utils/request';
import { buildOpenMRSVisit, buildOpenMRSVisitNote, buildOpenMRSObservation, buildOpenMRSPatient } from '../utils/openmrs';
import { logger } from '../../logger';

const router = Router();

router.post(
  '/encounter',
  requestHandler(async (req) => {
    const patient_response = await getFHIRPatientResource(req.body.patient_uuid);

    if (patient_response.status != 200) {
      return { status: 500, data: { error: 'Error getting patient' } };
    } else if (!patient_response.data?.entry || patient_response.data.entry.length === 0) {
      return { status: 400, data: { error: 'Patient not found' } };
    }

    const patient_id = patient_response.data.entry[0].resource?.id;

    if (!patient_id) {
      return { status: 400, data: { error: 'Patient ID is null or undefined' } };
    }

    const openMRSVisit = buildOpenMRSVisit(patient_id, req.body.reported_date);
    var enc_response = await createFhirResource({ ...openMRSVisit, resourceType: 'Encounter' });

    if (enc_response.status != 200 && enc_response.status != 201) {
      return { status: 400, data: { error: 'Error saving Visit Encounter' } };
    }

    const openMRSVisitNote = buildOpenMRSVisitNote(patient_id, req.body.reported_date, enc_response.data.id);
    enc_response = await createFhirResource({ ...openMRSVisitNote, resourceType: 'Encounter' });

    if (enc_response.status != 200 && enc_response.status != 201) {
      return { status: 400, data: { error: 'Error saving Visit Note' } };
    }

    const encounter_id = enc_response.data.id;
    for (const entry of req.body.observations) {
      if (entry.valueCode || entry.valueString || entry.valueDateTime) {
        const openMRSObservation = buildOpenMRSObservation(patient_id, encounter_id, entry);
        const obsResponse = createFhirResource({ ...openMRSObservation, resourceType: 'Observation' });
      }
    }
    return { status: 201, data: {}};
  })
);

router.post(
  '/patient',
  requestHandler(async (req) => {
    const openMRSPatient = buildOpenMRSPatient(req.body);
    return createFhirResource({ ...openMRSPatient, resourceType: 'Patient' });
  })
);

export default router;
