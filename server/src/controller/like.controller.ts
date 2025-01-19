import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import { Like } from '../model/like.model';
import { Types } from 'mongoose';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const togglePostLike = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const isPostLiked = await Like.findOne({
    post: new Types.ObjectId(postId),
    likedBy: new Types.ObjectId(userId)
  });

  if (!isPostLiked) {
    const newPostLike = await Like.create({
      post: new Types.ObjectId(postId),
      likedBy: new Types.ObjectId(userId)
    });

    if (!newPostLike)
      return ApiError(next, new Error('Error while liking a post'), req, statusCodes.INTERNAL_SERVER_ERROR);

    return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, newPostLike);
  }

  await isPostLiked.deleteOne();

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
});

export { togglePostLike };
