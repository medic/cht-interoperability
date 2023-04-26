import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export interface Response {
  status: number,
  data: any
}

export type RequestHandler = (
  // eslint-disable-next-line no-unused-vars
  req: ExpressRequest
) => Promise<{ status: number; data: any }>;

export function requestHandler(handler: RequestHandler) {
  return (req: ExpressRequest, res: ExpressResponse) =>
    handler(req).then(({ status = 200, data }) => {
      res.status(status).send(data);
    });
}
