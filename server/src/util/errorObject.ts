import { Request } from 'express';
import { HttpError } from '../types/types';
import responseMessage from '../constant/responseMessage';
import config from '../config/config';
import { ApplicationEnviroment } from '../constant/application';

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
    trace: isError ? { error: err.stack } : null
  };

  if (config.ENV === ApplicationEnviroment.PRODUCTION) {
    delete errorObj.request.ip;
    delete errorObj.trace;
  }

  return errorObj;
};
