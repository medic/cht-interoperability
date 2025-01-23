import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { sync, startListeners, stopListeners } from '../controllers/openmrs';

const router = Router();

router.get(
  '/sync',
  requestHandler((req) => sync())
);

router.post(
  '/listeners/start',
  requestHandler((req) => startListeners())
);

router.post(
  '/listeners/stop',
  requestHandler((req) => stopListeners())
);

export default router;
