import { NextFunction, Request, Response } from 'express';
// import ApiResponse from '../util/ApiResponse';
import ApiError from '../util/ApiError';

const healthcheck = (req: Request, _: Response, next: NextFunction) => {
  // ApiResponse(req, res, 200, 'Health Check endpoint hit', {});
  ApiError(next, new Error('Something Wrong'), req, 500, 'Hello');
};

export { healthcheck };
