import { Router } from "express";
import { createOrganization } from "../controllers/organization";
import { validateBodyAgainst } from "../middlewares";
import { validateFhirResource } from "../utils/fhir";
import { OrganizationSchema } from "../middlewares/schemas/organization";
import { requestHandler } from "../utils/request";

const router = Router();

router.post(
  "/",
  validateBodyAgainst(validateFhirResource("Organization"), OrganizationSchema),
  requestHandler((req) => createOrganization(req.body))
);

export default router;
