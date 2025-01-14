import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import { ApplicationEnvironment } from '../constant/application';
import { rateLimiterMongo } from '../config/rateLimiter';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import responseMessage from '../constant/responseMessage';

export default (req: Request, _: Response, next: NextFunction) => {
  if (config.ENV === ApplicationEnvironment.DEVELOPMENT) {
    return next();
  }

  if (rateLimiterMongo) {
    rateLimiterMongo
      .consume(req.ip as string, 1)
      .then(() => next())
      .catch(() => {
        ApiError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, statusCodes.TOO_MANY_REQUESTS);
      });
  }
};
