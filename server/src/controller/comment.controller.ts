import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import { Comment } from '../model/comment.model';
import { newComment } from '../schema/comment.schema';
import { Types } from 'mongoose';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const createNewComment = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const validation = newComment.safeParse(req.body);
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

export { createNewComment };
