import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { sync } from '../controllers/openmrs'

const router = Router();

router.get(
  '/sync',
  requestHandler((req) => sync())
);

export default router;
