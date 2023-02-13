import {Request, Response, Router} from 'express';
import { createPatient } from '../controllers/patient';

const router = Router();
const {validateBodyAgainst} = require('../middlewares');
const {createPatientSchema} = require('../middlewares/schemas/patient');

router.post('/',
  validateBodyAgainst(createPatientSchema),
  async function(req: Request, res: Response) {
    const {status, patient} = await createPatient(req.body);
    res.send({status, patient});
});

module.exports = router;
