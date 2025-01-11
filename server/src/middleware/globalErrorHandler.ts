import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/types';

export default (err: HttpError, _: Request, res: Response, __: NextFunction) => {
  res.status(err.status).json(err);
};
