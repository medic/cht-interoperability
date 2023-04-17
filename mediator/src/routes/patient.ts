import { Router } from "express";
import { createPatient } from "../controllers/patient";
import { validateBodyAgainst } from "../middlewares";
import { validateFhirResource } from "../utils/fhir";
import { PatientSchema } from "../middlewares/schemas/patient";
import { requestHandler } from "../utils/request";

const router = Router();

const resourceType = "Patient";

router.post(
  "/",
  validateBodyAgainst(validateFhirResource(resourceType), PatientSchema),
  requestHandler((req) => createPatient({ ...req.body, resourceType }))
);

export default router;
