import { Router } from "express";
import { createPatient } from "../controllers/patient";
import { validateBodyAgainst } from "../middlewares";
import { validateFhirResource } from "../middlewares/schemas/fhir";
import { PatientSchema } from "../middlewares/schemas/patient";
import { requestHandler } from "../utils/request";

const router = Router();

router.post(
  "/",
  validateBodyAgainst(validateFhirResource("Patient"), PatientSchema),
  requestHandler((req) => createPatient(req.body))
);

export default router;
