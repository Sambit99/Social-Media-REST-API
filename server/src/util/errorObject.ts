import { Request } from 'express';
import { HttpError } from '../types/types';
import responseMessage from '../constant/responseMessage';
import config from '../config/config';
import { ApplicationEnvironment } from '../constant/application';
import Logger from './Logger';

export default (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  err: Error | unknown,
  req: Request,
  errorStatusCode: number = 500,
  customErrorMessage: string = ''
): HttpError => {
  const isError = err instanceof Error;
  const errorObj: HttpError = {
    success: false,
    status: errorStatusCode,
    request: {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl
    },
    message: customErrorMessage ? customErrorMessage : isError ? err.message : responseMessage.INTERNAL_SERVER_ERROR,
    data: null,
    trace: isError ? { error: err.stack } : err instanceof Object ? err : null
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (config.ENV === ApplicationEnvironment.PRODUCTION) {
    delete errorObj.request.ip;
    delete errorObj.trace;
  }

  Logger.error(`CONTROLLER ERROR`, { meta: errorObj });

  return errorObj;
};
