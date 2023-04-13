import { validateBodyAgainst } from "../middlewares";
import { validateFhirResource } from "../utils/fhir";
import { requestHandler } from "../utils/request";
import { Router } from "express";
import { createServiceRequest } from "../controllers/service-request";
import { ServiceRequestSchema } from "../middlewares/schemas/service-request";

const router = Router();

const resourceType = "ServiceRequest";

router.post(
  "/",
  validateBodyAgainst(validateFhirResource(resourceType), ServiceRequestSchema),
  requestHandler((req) => createServiceRequest({...req.body, resourceType}))
);

export default router;
