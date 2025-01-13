import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../util/ApiResponse';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import responseMessage from '../constant/responseMessage';
import { AsyncHandler } from '../util/AsyncHandler';
import Quicker from '../util/Quicker';

export default {
  self: (req: Request, res: Response, next: NextFunction) => {
    try {
      ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
    } catch (error) {
      ApiError(next, error, req, statusCodes.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
    }
  },
  health: AsyncHandler((req: Request, res: Response, next: NextFunction) => {
    try {
      const healthData = {
        application: Quicker.getApplicationHealth(),
        system: Quicker.getSystemHealth(),
        timestamp: Date.now()
      };
      ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, healthData);
    } catch (error) {
      ApiError(next, error, req, statusCodes.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
    }
  })
};
