import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { validateFhirResource } from '../utils/fhir';
import { requestHandler } from '../utils/request';
import { createEndpoint } from '../controllers/endpoint';

const router = Router();

const resourceType = 'Endpoint';

router.post(
  '/',
  validateBodyAgainst(validateFhirResource(resourceType)),
  requestHandler((req) => createEndpoint({ ...req.body, resourceType }))
);

export default router;
