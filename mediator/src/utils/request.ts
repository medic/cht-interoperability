import { Request, Response } from "express";

export type RequestHandler = (
  req: Request
) => Promise<{ status: number; data: any }>;

export function requestHandler(handler: RequestHandler) {
  return (req: Request, res: Response) =>
    handler(req).then(({ status = 200, data }) => {
      res.status(status).send(data);
    });
}
