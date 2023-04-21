import { Router } from 'express';
import { createOrganization } from '../controllers/organization';
import { validateBodyAgainst } from '../middlewares';
import { validateFhirResource } from '../utils/fhir';
import { OrganizationSchema } from '../middlewares/schemas/organization';
import { requestHandler } from '../utils/request';

const router = Router();

const resourceType = 'Organization';

router.post(
  '/',
  validateBodyAgainst(validateFhirResource(resourceType), OrganizationSchema),
  requestHandler((req) => createOrganization({ ...req.body, resourceType }))
);

export default router;
