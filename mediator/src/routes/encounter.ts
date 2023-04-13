import { Request, Response, Router}  from 'express';
import { validateBodyAgainst } from '../middlewares';
import { EncounterSchema } from '../middlewares/schemas/encounter';
import { createEncounter } from '../controllers/encounter';
import { validateFhirResource } from '../utils/fhir';

const router = Router();

router.post('/',
  validateBodyAgainst(validateFhirResource("Encounter"), EncounterSchema),
  async function(req: Request, res: Response) {
    const {status, encounter} = await createEncounter(req.body);
    res.status(status).send(encounter);
  });

export default router;
  