import {Request, Response, Router} from 'express';
import {validateBodyAgainst} from '../middlewares';
import {createServiceRequest} from '../controllers/service-request';
import {createServiceSchema} from '../middlewares/schemas/service-request';

const router = Router();

router.post(
  '/',
  validateBodyAgainst(createServiceSchema),
  async function (req: Request, res: Response) {
    const {status, data} = await createServiceRequest(req.body);
    res.status(status).send(data);
  });

export default router;
