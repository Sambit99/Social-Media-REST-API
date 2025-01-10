import { Request, Response } from 'express';
import { HttpResponse } from '../types/types';
import config from '../config/config';
import { ApplicationEnviroment } from '../constant/application';

export default (
  req: Request,
  res: Response,
  resposneStatusCode: number,
  responseMessage: string,
  data: unknown = null
): void => {
  const response: HttpResponse = {
    success: true,
    status: resposneStatusCode,
    request: {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl
    },
    message: responseMessage,
    data
  };

  if (config.ENV === ApplicationEnviroment.PRODUCTION) delete response.request.ip;

  res.status(resposneStatusCode).json(response);
};
