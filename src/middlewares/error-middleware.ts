import { CustomError } from '../utils/api-errors';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.status).send({ errors: err.serializeError() });
  }
  console.error(err);
  res.status(500).send({ errors: [{ message: err.message }] });
};
