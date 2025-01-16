import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import { Follow } from '../model/follow.model';
import { Types } from 'mongoose';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';

interface AuthenticatedRequest extends Request {
  user: IUser;
}
const toggleFollow = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  const followUser = req.params.userId;

  const isFollowing = await Follow.findOne({
    follower: new Types.ObjectId(userId),
    followed: new Types.ObjectId(followUser)
  });

  if (!isFollowing) {
    const newFollower = await Follow.create({
      follower: new Types.ObjectId(userId),
      followed: new Types.ObjectId(followUser)
    });

    if (!newFollower)
      return ApiError(next, new Error('Error while following user'), req, statusCodes.INTERNAL_SERVER_ERROR);

    return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, newFollower);
  }

  await Follow.findOneAndDelete({ follower: new Types.ObjectId(userId), followed: new Types.ObjectId(followUser) });

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
});

export { toggleFollow };
