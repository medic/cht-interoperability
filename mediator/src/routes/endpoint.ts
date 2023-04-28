import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { createFhirResource, validateFhirResource } from '../utils/fhir';
import { requestHandler } from '../utils/request';

const router = Router();

const resourceType = 'Endpoint';

router.post(
  '/',
  validateBodyAgainst(validateFhirResource(resourceType)),
  requestHandler((req) => createFhirResource({ ...req.body, resourceType }))
);

export default router;
