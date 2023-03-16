import {Request, Response} from 'express';

type RequestHandler = () => Promise<{status: number, data: any}>;

function requestHandler(handler: RequestHandler) {
  return  (req: Request, res: Response) => {
    handler()
      .then(({status, data}) => {
        res.status(status).send(data);
      });
  };
}

module.exports = {
  requestHandler,
};
