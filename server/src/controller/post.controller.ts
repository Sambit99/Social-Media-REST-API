import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import { uploadFileSchema, uploadPostSchema } from '../schema/post.schema';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import responseMessage from '../constant/responseMessage';
import { Post, PostVisibility } from '../model/post.model';
import mongoose from 'mongoose';
import { uploadOnCloudinary } from '../util/Cloudinary';
import ApiResponse from '../util/ApiResponse';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const createNewPost = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const fileValidation = uploadFileSchema.safeParse(req.files);
  if (!fileValidation.success)
    return ApiError(next, fileValidation.error.errors, req, statusCodes.BAD_REQUEST, responseMessage.FAILED);

  const postValidation = uploadPostSchema.safeParse(req.body);
  if (!postValidation.success)
    return ApiError(next, postValidation.error.errors, req, statusCodes.BAD_REQUEST, responseMessage.FAILED);

  const { content, visibility } = postValidation.data;
  const { imageFile, videoFile } = fileValidation.data;
  const userId = req.user._id;

  const newPost = await Post.create({ owner: new mongoose.Types.ObjectId(userId) });
  if (content) newPost.content = content;
  if (visibility) newPost.visibility = visibility;
  if (imageFile && imageFile.length) {
    const uploadedImage = await uploadOnCloudinary(imageFile[0].path);
    newPost.imageFile = uploadedImage?.url as string;
  }

  if (videoFile && videoFile.length) {
    const uploadedVideo = await uploadOnCloudinary(videoFile[0].path);
    newPost.videoFile = uploadedVideo?.url as string;
  }

  await newPost.save();

  if (!(newPost.videoFile || newPost.imageFile))
    return ApiError(next, new Error('Error while uploading to Cloudinary'), req, statusCodes.INTERNAL_SERVER_ERROR);

  return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, newPost);
});

const getPublicPosts = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const posts = await Post.find({ visibility: PostVisibility.PUBLIC }).sort({ createdAt: -1 });

  if (!posts) return ApiError(next, new Error('No posts found'), req, statusCodes.BAD_REQUEST);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, posts);
});

const getPostById = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const postId = req.params.postId;

  const post = await Post.findById(postId);

  if (!post) return ApiError(next, new Error('No post found with given id'), req, statusCodes.BAD_REQUEST);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, post);
});

export { createNewPost, getPublicPosts, getPostById };
