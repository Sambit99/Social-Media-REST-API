import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import { Comment } from '../model/comment.model';
import { newCommentSchema, updateCommentSchema } from '../schema/comment.schema';
import { Types } from 'mongoose';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';
import { IPost, Post } from '../model/post.model';
import { NOTIFICATION_TYPES } from '../model/notification.model';
import { createNewCommentNotification } from '../util/Notification';
import { client } from '../services/redisClient';
import { TimeInSeconds } from '../constant/application';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const createNewComment = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const validation = newCommentSchema.safeParse(req.body);
  if (!validation.success) return ApiError(next, validation.error.errors, req, statusCodes.BAD_REQUEST);

  const postId = req.params.postId;
  const userId = req.user._id;

  const { content } = validation.data;

  const comment = await Comment.create({
    content,
    post: new Types.ObjectId(postId),
    commentedBy: new Types.ObjectId(userId)
  });

  const post: IPost = (await Post.findById(postId)) as IPost;

  if (!comment)
    return ApiError(next, new Error('Error while creating comment'), req, statusCodes.INTERNAL_SERVER_ERROR);

  await createNewCommentNotification(
    userId,
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    post.owner.toString(),
    NOTIFICATION_TYPES.COMMENT,
    `${req.user.fullname} added a comment`,
    comment._id as string
  );
  return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, comment);
});

const deleteComment = AsyncHandler(async (req: AuthenticatedRequest, res: Response, _: NextFunction) => {
  const commentId = req.params.commentId;

  await Comment.findByIdAndDelete(commentId);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
});

const updateComment = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId;

  const validation = updateCommentSchema.safeParse(req.body);
  if (!validation.success) return ApiError(next, validation.error.errors, req, statusCodes.BAD_REQUEST);

  const { content } = validation.data;

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    content,
    isEdited: true
  });

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, updatedComment);
});

const getAllPostComments = AsyncHandler(async (req: AuthenticatedRequest, res: Response, _: NextFunction) => {
  const postId = req.params.postId;

  const result = await client.get(`posts:${postId}:comments`);
  if (result) return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, JSON.parse(result));

  const allComments = await Comment.aggregate([
    {
      $match: {
        post: new Types.ObjectId(postId)
      }
    },
    {
      $group: {
        _id: '$post',
        comments: { $addToSet: '$_id' },
        totalComments: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'comments',
        localField: 'comments',
        foreignField: '_id',
        as: 'comments',
        pipeline: [
          {
            $project: {
              commentedBy: 1,
              content: 1,
              likesCount: 1,
              isEdited: 1
            }
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
              _id: 0,
              __v: 0
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        post: 1,
        comments: 1,
        totalComments: 1
      }
    }
  ]);

  await client.set(`posts:${postId}:comments`, JSON.stringify(allComments), 'EX', TimeInSeconds.DAY_IN_SECONDS);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, allComments);
});

export { createNewComment, deleteComment, updateComment, getAllPostComments };
