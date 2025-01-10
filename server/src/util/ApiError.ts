import { NextFunction, Request } from 'express';
import errorObject from './errorObject';
import { HttpError } from '../types/types';

export default (
  nextFunction: NextFunction,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  err: Error | unknown,
  req: Request,
  errorStatusCode: number = 500,
  customErrorMessage: string = ''
) => {
  const errorObj: HttpError = errorObject(err, req, errorStatusCode, customErrorMessage);

  nextFunction(errorObj);
};
