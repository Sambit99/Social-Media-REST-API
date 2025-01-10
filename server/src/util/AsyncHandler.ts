import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const AsyncHandler = (requestHandler: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { AsyncHandler };
