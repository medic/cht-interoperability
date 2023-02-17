import { Request } from 'express';
import {validateBodyAgainst} from '../middlewares';

const {Router} = require('express');
const {createServiceRequest} = require('../controllers/service-request');
const {requestHandler} = require('../utils/request');
const {createServiceSchema} = require('../middlewares/schemas/service-request');

const router = Router();

router.post(
  '/',
  validateBodyAgainst(createServiceSchema),
  requestHandler((req: Request) => createServiceRequest(req.body))
);

export default router;
