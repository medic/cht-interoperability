import { Request, Response } from 'express';

function requestHandler(handler: (req: Request) => Promise<{status: number, data: any}>) {
  return  (req: Request, res: Response) => {
    handler(req)
    .then(({status, data}) => {
      res.status(status).send(data);
    });
  };
}

module.exports = {
  requestHandler,
};
