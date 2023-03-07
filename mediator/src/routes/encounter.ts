import {Request, Response, Router} from 'express';

const router = Router();

router.post('/',
  async function(req: Request, res: Response) {
    res.send({status: 'success'});
  });
  