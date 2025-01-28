import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { AsyncHandler } from '../util/AsyncHandler';
import { updatePostSchema, uploadFileSchema, uploadPostSchema } from '../schema/post.schema';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import responseMessage from '../constant/responseMessage';
import { Post, PostVisibility } from '../model/post.model';
import mongoose, { Types } from 'mongoose';
import { uploadOnCloudinary } from '../util/Cloudinary';
import ApiResponse from '../util/ApiResponse';
import { createNewPostNotification } from '../util/Notification';
import { NOTIFICATION_TYPES } from '../model/notification.model';
import { client } from '../services/redisClient';
import { TimeInSeconds } from '../constant/application';

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

  await createNewPostNotification(
    userId,
    NOTIFICATION_TYPES.POST,
    `${req.user.fullname} posted a new post`,
    newPost._id as string
  );
  return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, newPost);
});

const getPublicPosts = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const posts = await Post.find({ visibility: PostVisibility.PUBLIC }).sort({ createdAt: -1 });

  if (!posts) return ApiError(next, new Error('No posts found'), req, statusCodes.BAD_REQUEST);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, posts);
});

const getPostById = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const postId = req.params.postId;

  const result = await client.get(`posts:${postId}:post`);
  if (result) return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, JSON.parse(result));

  const post = await Post.findById(postId);

  if (!post) return ApiError(next, new Error('No post found with given id'), req, statusCodes.BAD_REQUEST);

  await client.set(`posts:${postId}:post`, JSON.stringify(post), 'EX', TimeInSeconds.X_DAYS_IN_SECONDS(30));

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, post);
});

const getSpecificUserPosts = AsyncHandler(async (req: AuthenticatedRequest, res: Response, _: NextFunction) => {
  const specificUserId = req.params.userId;

  const result = await client.get(`users:${specificUserId}:posts`);
  if (result) return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, JSON.parse(result));

  const allPosts = await Post.aggregate([
    {
      $match: {
        owner: new Types.ObjectId(specificUserId)
      }
    },
    // Note: Add this condition to filter out only public posts
    /*
    {
      $group: {
        _id: '$owner',
        posts: { $addToSet: '$_id' },
        totalPosts: { $sum: 1 }
      }
    },*/
    {
      $lookup: {
        from: 'posts',
        localField: 'posts',
        foreignField: '_id',
        as: 'posts',
        pipeline: [{ $sort: { createdAt: -1 } }, { $project: { owner: 0 } }]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'owner',
        pipeline: [{ $project: { username: 1, fullname: 1 } }]
      }
    },
    { $project: { _id: 0, owner: 1, posts: 1, totalPosts: 1 } }
  ]);

  await client.set(`users:${specificUserId}:posts`, JSON.stringify(allPosts), 'EX', TimeInSeconds.DAY_IN_SECONDS);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, allPosts);
});

const updatePostById = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const postId = req.params.postId;

  const validation = updatePostSchema.safeParse(req.body);
  if (!validation.success)
    return ApiError(next, validation.error.errors, req, statusCodes.BAD_REQUEST, responseMessage.FAILED);

  const { content, visibility } = validation.data;
  const post = await Post.findById(postId);
  if (!post) return ApiError(next, new Error('No post found with given id'), req, statusCodes.BAD_REQUEST);
  if (content) post.content = content;
  if (visibility) post.visibility = visibility;

  await post.save();

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, post);
});

const deletePostById = AsyncHandler(async (req: AuthenticatedRequest, res: Response, _: NextFunction) => {
  const postId = req.params.postId;
  await Post.findByIdAndDelete(postId);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, {});
});

export { createNewPost, getPublicPosts, getPostById, updatePostById, deletePostById, getSpecificUserPosts };
