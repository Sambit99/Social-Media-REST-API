import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../util/AsyncHandler';
import { IUser, User } from '../model/user.model';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import responseMessage from '../constant/responseMessage';
import ApiResponse from '../util/ApiResponse';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const getCurrentUser = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req?.user._id;

  const user = await User.findById(userId);
  if (!user) return ApiError(next, new Error('User not found'), req, statusCodes.UNAUTHORIZED, responseMessage.FAILED);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, user);
});

const getUserById = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  const user = await User.findById(userId).select('-refreshToken');
  if (!user) return ApiError(next, new Error('User not found'), req, statusCodes.UNAUTHORIZED, responseMessage.FAILED);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, user);
});

const deleteUser = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  const user = await User.findByIdAndDelete(userId);
  if (!user) return ApiError(next, new Error('User not found'), req, statusCodes.UNAUTHORIZED, responseMessage.FAILED);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
});

export { getCurrentUser, getUserById, deleteUser };