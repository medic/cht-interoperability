import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { createFhirResource, validateFhirResource } from '../utils/fhir';
import { PatientSchema } from '../middlewares/schemas/patient';
import { requestHandler } from '../utils/request';

const router = Router();

const resourceType = 'Patient';

router.post(
  '/',
  validateBodyAgainst(validateFhirResource(resourceType), PatientSchema),
  requestHandler((req) => createFhirResource({ ...req.body, resourceType }))
);

export default router;
