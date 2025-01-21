import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../util/AsyncHandler';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/config';
import { IUser, User } from '../model/user.model';
import { Model, Types } from 'mongoose';
import responseMessage from '../constant/responseMessage';
import { Document } from 'mongoose';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const isLoggedIn = AsyncHandler(async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
  try {
    const token = (req.cookies?.accessToken as string) || req.header('Authorization')?.replace('Bearer', '');
    if (!token) return ApiError(next, new Error('Token expired or not found'), req, statusCodes.UNAUTHENTICATED);

    const decodedToken: JwtPayload = jwt.verify(token, config.ACCESS_TOKEN_SECRET as jwt.Secret) as JwtPayload;

    const existingUser = await User.findById(decodedToken._id);

    if (!existingUser) return ApiError(next, new Error(`User doesn't exist`), req, statusCodes.UNAUTHENTICATED);

    req.user = existingUser;
    next();
  } catch (error) {
    return ApiError(next, error, req);
  }
});

const onlyOwner = <T extends Document>(model: Model<T>, ownerFieldName: string, idName: string) => {
  return AsyncHandler(async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    try {
      const id = req.params[idName];
      const userId = new Types.ObjectId(req.user._id);
      const record = await model.findById(id);

      if (!record) return ApiError(next, new Error('Record not found'), req, statusCodes.BAD_REQUEST);

      const recordOwner = record[ownerFieldName as keyof T] as Types.ObjectId;

      if (!recordOwner || !recordOwner.equals(userId))
        return ApiError(next, new Error(responseMessage.UNAUTHORIZED), req, statusCodes.UNAUTHORIZED);

      next();
    } catch (error) {
      next(error);
    }
  });
};

const restrictTo = (...allowedRoles: Array<string>) => {
  return AsyncHandler(async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    const userId = req.user._id;

    const user = (await User.findById(userId)) as IUser;

    if (!allowedRoles.includes(user.role))
      return ApiError(next, new Error(responseMessage.UNAUTHORIZED), req, statusCodes.UNAUTHORIZED);

    next();
  });
};

export { isLoggedIn, onlyOwner, restrictTo };
