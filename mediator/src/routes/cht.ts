import { Router } from 'express';
import { PatientSchema } from '../middlewares/schemas/patient';
import { requestHandler } from '../utils/request';
import { createChtPatient, chtRecordFromObservations } from '../utils/cht';
import { logger } from '../../logger';

const router = Router();

const resourceType = 'Patient';

router.post(
  '/patient',
  requestHandler(async (req) => {
    logger.info(JSON.stringify(req.body));
    const response = await createChtPatient(req.body);
    return { status: response.status, data: response.data }
  })
);

router.post(
  '/observations',
  requestHandler(async (req) => {
    const response = await chtRecordFromObservations('a60dec895aa93569df4e1513210009b8', req.body)
    return { status: response.status, data: response.data }
  })
);
export default router;
