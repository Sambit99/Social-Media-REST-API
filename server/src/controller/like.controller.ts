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

const getPostLikes = AsyncHandler(async (req: AuthenticatedRequest, res: Response, _: NextFunction) => {
  const postId = req.params.postId;

  const postLikes = await Like.aggregate([
    {
      $match: { post: new Types.ObjectId(postId) }
    },
    {
      $group: {
        _id: '$post',
        likedBy: { $addToSet: '$likedBy' },
        totalLikes: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'likedBy',
        foreignField: '_id',
        as: 'likedBy',
        pipeline: [
          {
            $project: { username: 1, fullname: 1 }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: '_id',
        as: 'post',
        pipeline: [
          {
            $project: {
              owner: 1,
              content: 1,
              imageFile: 1,
              videoFile: 1,
              visibility: 1,
              likesCount: 1,
              commentsCount: 1,
              sharesCount: 1
            }
          }
        ]
      }
    },
    {
      $project: { _id: 0, post: 1, likedBy: 1, totalLikes: 1 }
    }
  ]);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, postLikes);
});

export { togglePostLike, getPostLikes };
