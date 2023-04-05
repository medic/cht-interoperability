import {Request, Response, NextFunction} from 'express';
import {ValidationError} from 'joi';

export const validateBodyAgainst = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) =>
    schema
      .validateAsync(req.body, {abortEarly: true})
      .then(() => next())
      .catch(({details}: ValidationError) =>
        res.status(400).send({message: details[0].message})
      );
};
