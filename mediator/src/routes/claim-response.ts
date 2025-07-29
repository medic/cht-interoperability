import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { createFhirResource, validateFhirResource } from '../utils/fhir';
import { ClaimResponseSchema } from '../middlewares/schemas/claim-response';
import { requestHandler } from '../utils/request';

const router = Router();

const resourceType = 'ClaimResponse';

router.post(
  '/',
  validateBodyAgainst(validateFhirResource(resourceType), ClaimResponseSchema),
  requestHandler(req => createFhirResource({ ...req.body, resourceType }))
);

export default router;
