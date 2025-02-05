import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import { Follow } from '../model/follow.model';
import { Types } from 'mongoose';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';
import { client } from '../services/redisClient';
import { TimeInSeconds } from '../constant/application';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const followUser = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  const followUser = req.params.userId;

  const isFollowing = await Follow.findOne({
    follower: new Types.ObjectId(userId),
    followed: new Types.ObjectId(followUser)
  });

  if (isFollowing) {
    return ApiError(next, new Error('User not found or already following'), req, statusCodes.BAD_REQUEST);
  }

  const newFollower = await Follow.create({
    follower: new Types.ObjectId(userId),
    followed: new Types.ObjectId(followUser)
  });

  if (!newFollower)
    return ApiError(next, new Error('User not found or already following'), req, statusCodes.INTERNAL_SERVER_ERROR);

  // Note: In case user follows a new user we'll just remove the user following key from redis
  await client.del(`users:${userId}:followings`);

  return ApiResponse(req, res, statusCodes.CREATED, 'Successfully followed the user', newFollower);
});

const unFollowUser = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  const followUser = req.params.userId;

  const isFollowing = await Follow.findOne({
    follower: new Types.ObjectId(userId),
    followed: new Types.ObjectId(followUser)
  });

  if (!isFollowing) {
    return ApiError(next, new Error('User not found or not following'), req, statusCodes.BAD_REQUEST);
  }

  await Follow.findOneAndDelete({ follower: new Types.ObjectId(userId), followed: new Types.ObjectId(followUser) });

  // Note: In case user un-follows a user we'll just remove the user following key from redis
  await client.del(`users:${userId}:followings`);

  return ApiResponse(req, res, statusCodes.OK, 'Successfully un-followed the user', {});
});

const getFollowers = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const result = await client.get(`users:${userId}:followers`);
  if (result) return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, JSON.parse(result));

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

  await client.set(`users:${userId}:followers`, JSON.stringify(followers), 'EX', TimeInSeconds.DAY_IN_SECONDS);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, followers);
});

const getFollowing = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  const result = await client.get(`users:${userId}:followings`);
  if (result) return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, JSON.parse(result));

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

  await client.set(`users:${userId}:followings`, JSON.stringify(followings), 'EX', TimeInSeconds.DAY_IN_SECONDS);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, followings);
});

export { followUser, unFollowUser, getFollowers, getFollowing };
