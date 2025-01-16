import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../util/AsyncHandler';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/config';
import { IUser, User } from '../model/user.model';

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

export { isLoggedIn };
