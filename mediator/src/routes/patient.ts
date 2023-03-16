import {Request, Response, Router} from 'express';
import { createPatient } from '../controllers/patient';
import {validateBodyAgainst}  from '../middlewares';
import {createPatientSchema} from '../middlewares/schemas/patient';

const router = Router();

router.post('/',
  validateBodyAgainst(createPatientSchema),
  async function(req: Request, res: Response) {
    const {status, data} = await createPatient(req.body);
    res.status(status).send(data);
});

export default router;
