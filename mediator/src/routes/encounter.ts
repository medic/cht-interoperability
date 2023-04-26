import { Router } from 'express';
import { validateBodyAgainst } from '../middlewares';
import { EncounterSchema } from '../middlewares/schemas/encounter';
import { createFhirResource, validateFhirResource } from '../utils/fhir';
import { requestHandler } from '../utils/request';

const router = Router();

const resourceType = 'Encounter';

router.post(
  '/',
  validateBodyAgainst(validateFhirResource(resourceType), EncounterSchema),
  requestHandler((req) => createFhirResource({ ...req.body, resourceType }))
);

export default router;
