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

  if (!comment)
    return ApiError(next, new Error('Error while creating comment'), req, statusCodes.INTERNAL_SERVER_ERROR);

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

  res.status(200).json(allComments);
});

export { createNewComment, deleteComment, updateComment, getAllPostComments };
