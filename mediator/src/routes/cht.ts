import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { validateBodyAgainst } from '../middlewares';
import { ChtPatientSchema, ChtPatientIdsSchema, ChtEncounterFormSchema } from '../middlewares/schemas/cht';
import { createPatient, updatePatientIds, createEncounter } from '../controllers/cht'

const router = Router();

const resourceType = 'Patient';

router.post(
  '/patient',
  validateBodyAgainst(ChtPatientSchema),
  requestHandler((req) => createPatient(req.body))
);

router.post(
  '/patient_ids',
  validateBodyAgainst(ChtPatientIdsSchema),
  requestHandler((req) => updatePatientIds(req.body))
);

router.post(
  '/encounter',
  validateBodyAgainst(ChtEncounterFormSchema),
  requestHandler((req) => createEncounter(req.body))
);

export default router;
