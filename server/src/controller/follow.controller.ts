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

const getFollowers = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  const followers = await Follow.aggregate([
    { $match: { followed: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$followed',
        followers: { $addToSet: '$follower' },
        totalFollowers: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followers',
        pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'followed',
        pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }]
      }
    },
    {
      $project: { _id: 0, followed: 1, followers: 1, totalFollowers: 1 }
    }
  ]);

  if (!followers) return ApiError(next, new Error('No followers found'), req, statusCodes.NOT_FOUND);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, followers);
});

const getFollowing = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const followings = await Follow.aggregate([
    { $match: { follower: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$follower',
        following: { $addToSet: '$followed' },
        totalFollowing: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'following',
        foreignField: '_id',
        as: 'following',
        pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'follower',
        pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }]
      }
    },
    {
      $project: { _id: 0, follower: 1, following: 1, totalFollowing: 1 }
    }
  ]);

  if (!followings) return ApiError(next, new Error('No followings found'), req, statusCodes.NOT_FOUND);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, followings);
});

export { toggleFollow, getFollowers, getFollowing };
