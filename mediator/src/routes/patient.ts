import {Request, Response, Router} from 'express';
import { createPatient } from '../controllers/patient';
import {validateBodyAgainst}  from '../middlewares';
import {createPatientSchema} from '../middlewares/schemas/patient';

const router = Router();

router.post('/',
  validateBodyAgainst(createPatientSchema),
  async function(req: Request, res: Response) {
    const {status, patient} = await createPatient(req.body);
    res.send({status, patient});
});

export default router;
