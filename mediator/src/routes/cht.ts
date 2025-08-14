import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { validateBodyAgainst } from '../middlewares';
import { ChtClaimsFeedbackSchema } from '../middlewares/schemas/cht-openimis-schemas';
import { convertChtClaimToFhirCommunication,CHTClaimsFeedback } from '../mappers/openIMIS-interop/claims_communication_mapper';

const router = Router();

const resourceType = 'Patient';

router.post(
  '/claims-feedback',
  validateBodyAgainst(ChtClaimsFeedbackSchema),
  requestHandler((req) => convertChtClaimToFhirCommunication(req.body as unknown as CHTClaimsFeedback))
);
