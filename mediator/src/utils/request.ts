import { Request, Response } from "express";

export type RequestHandler = (
  req: Request
) => Promise<{ status: number; data: any }>;

export function requestHandler(handler: RequestHandler) {
<<<<<<< HEAD
  return  (req: Request, res: Response) => {
    handler(req)
    .then(({status, data}) => {
=======
  return (req: Request, res: Response) =>
    handler(req).then(({ status = 200, data }) => {
>>>>>>> 2ed59a1 (completed writing tests for FHIR utility)
      res.status(status).send(data);
    });
}
