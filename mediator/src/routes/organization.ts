import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { createFhirResource, validateFhirResource } from '../utils/fhir';
import { OrganizationSchema } from '../middlewares/schemas/organization';
import { requestHandler } from '../utils/request';

const router = Router();

const resourceType = 'Organization';

router.post(
  '/',
  validateBodyAgainst(validateFhirResource(resourceType), OrganizationSchema),
  requestHandler((req) => createFhirResource({ ...req.body, resourceType }))
);

export default router;
