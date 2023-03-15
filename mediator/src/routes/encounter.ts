import { Request, Response, Router}  from 'express';
import { validateBodyAgainst } from '../middlewares';
import { createEncounterSchema } from '../middlewares/schemas/encounter';
import { createEncounter } from '../controllers/encounter';

const router = Router();

router.post('/',
  validateBodyAgainst(createEncounterSchema),
  async function(req: Request, res: Response) {
    const {status, encounter} = await createEncounter(req.body);
    res.status(status).send(encounter);
  });

export default router;
  