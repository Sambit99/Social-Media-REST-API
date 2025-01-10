import { Request, Response } from 'express';
import ApiResponse from '../util/ApiResponse';

const healthcheck = (req: Request, res: Response) => {
  ApiResponse(req, res, 200, 'Health Check endpoint hit', {});
};

export { healthcheck };
