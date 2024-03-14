import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { createFhirResource } from '../utils/fhir';
import { buildOpenMRSPatient } from '../utils/openmrs';
import { PatientSchema } from '../middlewares/schemas/patient';
import { requestHandler } from '../utils/request';

const router = Router();

const resourceType = 'Patient';

router.post(
  '/',
  validateBodyAgainst(PatientSchema),
  requestHandler((req) => {
    const openMRSPatient = buildOpenMRSPatient(req.body);
    return createFhirResource({ ...openMRSPatient, resourceType });
  })
);

export default router;
