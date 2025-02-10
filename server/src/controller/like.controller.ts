import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import { Like } from '../model/like.model';
import { Types } from 'mongoose';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';
import { createLikeNotification } from '../util/Notification';
import { IPost, Post } from '../model/post.model';
import { NOTIFICATION_TYPES } from '../model/notification.model';
import { Comment, IComment } from '../model/comment.model';
import { client } from '../services/redisClient';
import { TimeInSeconds } from '../constant/application';

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

    const post: IPost = (await Post.findById(postId)) as IPost;

    if (!newPostLike)
      return ApiError(next, new Error('Error while liking a post'), req, statusCodes.INTERNAL_SERVER_ERROR);

    await createLikeNotification(
      req.user._id,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      post.owner.toString(),
      NOTIFICATION_TYPES.LIKE,
      `${req.user.fullname} liked your post`,
      post._id as string
    );

    // Note: In case a user likes the post we'll delete this key from redis
    await client.del(`posts:${postId}:likes`);

    return ApiResponse(req, res, statusCodes.CREATED, 'Post liked successfully', newPostLike);
  }

  await Like.findOneAndDelete({
    post: new Types.ObjectId(postId),
    likedBy: new Types.ObjectId(userId)
  });

  // Note: In case a user un-likes the post we'll delete this key from redis
  await client.del(`posts:${postId}:likes`);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
});

const getPostLikes = AsyncHandler(async (req: AuthenticatedRequest, res: Response, _: NextFunction) => {
  const postId = req.params.postId;

  const result = await client.get(`posts:${postId}:likes`);
  if (result) return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, JSON.parse(result));

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

  await client.set(`posts:${postId}:likes`, JSON.stringify(postLikes), 'EX', TimeInSeconds.HOUR_IN_SECONDS);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, postLikes);
});

const getLikedPosts = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  const result = await client.get(`users:${userId}:likedPosts`);
  if (result) return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, JSON.parse(result));

  const userLikedPosts = await Like.aggregate([
    {
      $match: {
        likedBy: new Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: '$likedBy',
        posts: { $addToSet: '$post' },
        totalLikedPosts: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'posts',
        localField: 'posts',
        foreignField: '_id',
        as: 'posts',
        pipeline: [
          {
            $project: {
              content: 1,
              imageFile: 1,
              videoFile: 1,
              likesCount: 1,
              commentsCount: 1,
              sharesCount: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1
            }
          }
        ]
      }
    },
    {
      $project: { _id: 0, user: 1, posts: 1, totalLikedPosts: 1 }
    }
  ]);

  if (!userLikedPosts) return ApiError(next, new Error('No liked posts found'), req, statusCodes.BAD_REQUEST);

  await client.set(`users:${userId}:likedPosts`, JSON.stringify(userLikedPosts), 'EX', TimeInSeconds.HOUR_IN_SECONDS);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, userLikedPosts);
});

const toggleCommentLike = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId;
  const userId = req.user._id;

  const isCommentLiked = await Like.findOne({
    comment: new Types.ObjectId(commentId),
    likedBy: new Types.ObjectId(userId)
  });

  if (!isCommentLiked) {
    const newCommentLike = await Like.create({
      comment: new Types.ObjectId(commentId),
      likedBy: new Types.ObjectId(userId)
    });

    const comment: IComment = (await Comment.findById(commentId)) as IComment;

    if (!newCommentLike)
      return ApiError(next, new Error('Error while liking a Comment'), req, statusCodes.INTERNAL_SERVER_ERROR);

    await createLikeNotification(
      req.user._id,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      comment.commentedBy.toString(),
      NOTIFICATION_TYPES.COMMENT,
      `${req.user.fullname} liked your comment`,
      comment._id as string
    );
    return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, newCommentLike);
  }

  await Like.findOneAndDelete({
    comment: new Types.ObjectId(commentId),
    likedBy: new Types.ObjectId(userId)
  });
  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
});

export { togglePostLike, toggleCommentLike, getPostLikes, getLikedPosts };
