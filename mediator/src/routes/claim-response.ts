import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { processClaimResponse } from '../utils/openimis';
import { ClaimResponse } from 'fhir/r4';

const router = Router();

const resourceType = 'ClaimResponse';

router.post(
  '/',
  requestHandler(async req => processClaimResponse({
    ...req.body,
    resourceType
  } as unknown as ClaimResponse))
);

export default router;
