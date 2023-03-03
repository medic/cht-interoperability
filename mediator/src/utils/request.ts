import { Request, Response } from 'express';

type RequestHandler = (req: Request) => Promise<{status: number, data: any}>;

export function requestHandler(handler: RequestHandler) {
  return  (req: Request, res: Response) => {
    handler(req)
    .then(({status, data}) => {
      res.status(status).send(data);
    });
  };
}
