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
  requestHandler(async req => {
    const claimResponse = { ...req.body, resourceType };

    // Extract patient ID from patient.reference (e.g., "Patient/{id}")
    let patientId: string | undefined;
    if (claimResponse.patient?.reference) {
      const parts = claimResponse.patient.reference.split('/');
      patientId = parts.length > 1 ? parts[1] : parts[0];
    }

    // Extract claim ID from claimResponse.id (the resource's own ID)
    const claimId: string | undefined = claimResponse.id;

    // You can now use patientId and claimId as needed
    // TODO: get patient or create patient if not exists in CHT
    // TODO: get claims info or create a new report for the above patient

    // Continue with creating the FHIR resource
    return createFhirResource(claimResponse);
  })
);

export default router;
