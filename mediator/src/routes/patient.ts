import { Router } from 'express';
import { createPatient } from '../controllers/patient';
import { validateBodyAgainst } from '../middlewares';
import { createPatientSchema } from '../middlewares/schemas/patient';
import { requestHandler } from '../utils/request';

const router = Router();

router.post(
  "/",
  validateBodyAgainst(PatientSchema),
  requestHandler((req) => createPatient(req.body))
);

export default router;
