import { validateBodyAgainst } from '../middlewares';
import { requestHandler } from '../utils/request';

const { Router } = require('express');
const { createServiceRequest } = require('../controllers/service-request');
const {
  createServiceSchema,
} = require('../middlewares/schemas/service-request');

const router = Router();

router.post(
  '/',
  validateBodyAgainst(createServiceSchema),
  requestHandler((req) => createServiceRequest(req.body))
);

export default router;
