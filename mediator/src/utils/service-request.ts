import {Request, Response} from 'express';
import url from 'url';

type RequestHandler = () => Promise<{status: number, data: any}>;

export function requestHandler(handler: RequestHandler) {
  return  (req: Request, res: Response) => {
    handler()
      .then(({status, data}) => {
        res.status(status).send(data);
      });
  };
}

export function generateApiUrl(chtUrl: string, username: string, password: string) {
  const parsedUrl = url.parse(chtUrl);
  const {protocol, hostname} = parsedUrl;
  const apiURL = `${protocol}//${username}:${password}@${hostname}/api/v2/records`;

  return apiURL;
}
