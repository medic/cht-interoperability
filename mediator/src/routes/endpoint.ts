import { Router } from "express";
import { validateBodyAgainst } from "../middlewares";
import { validateFhirResource } from "../utils/fhir";
import { requestHandler } from "../utils/request";
import { createEndpoint } from "../controllers/endpoint";

const router = Router();

router.post(
  "/",
  validateBodyAgainst(validateFhirResource("Endpoint")),
  requestHandler((req) => createEndpoint(req.body))
);

export default router;
