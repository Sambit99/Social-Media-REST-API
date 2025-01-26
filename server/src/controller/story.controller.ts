import { NextFunction, Request, Response } from 'express';
import { IUser } from '../model/user.model';
import { newStoryFileSchema, newStorySchema } from '../schema/story.schema';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import { AsyncHandler } from '../util/AsyncHandler';
import { Story } from '../model/story.model';
import { Types } from 'mongoose';
import { uploadOnCloudinary } from '../util/Cloudinary';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';
import { Follow } from '../model/follow.model';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const createNewStory = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const fileValidation = newStoryFileSchema.safeParse(req.files);
  if (!fileValidation.success) return ApiError(next, fileValidation.error.errors, req, statusCodes.BAD_REQUEST);

  const storyValidation = newStorySchema.safeParse(req.body);
  const userId = req.user._id;
  const visibility = storyValidation.data?.visibility;
  const { imageFile, videoFile } = fileValidation.data;

  const newStory = await Story.create({ storyBy: new Types.ObjectId(userId) });

  if (imageFile && imageFile.length) {
    const uploadedImage = await uploadOnCloudinary(imageFile[0].path);
    newStory.imageFile = uploadedImage?.url as string;
  }
  if (videoFile && videoFile.length) {
    const uploadedVideo = await uploadOnCloudinary(videoFile[0].path);
    newStory.videoFile = uploadedVideo?.url as string;
  }

  if (visibility) newStory.visibility = visibility;

  await newStory.save();

  return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, newStory);
});

const getSpecificUserStory = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  const userStory = await Story.findOne({
    storyBy: new Types.ObjectId(userId),
    expiresAt: {
      $gt: new Date(Date.now())
    }
  });

  if (!userStory) return ApiError(next, new Error('No story found for the user'), req, statusCodes.BAD_REQUEST);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, userStory);
});

const getStory = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  const stories = await Follow.aggregate([
    {
      $match: {
        followed: new Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: '$followed',
        following: { $addToSet: '$follower' },
        totalFollowings: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'following',
        foreignField: '_id',
        as: 'following',
        pipeline: [{ $project: { username: 1, fullname: 1, avatar: 1 } }]
      }
    },
    {
      $lookup: {
        from: 'stories',
        localField: 'following',
        foreignField: 'storyBy',
        as: 'stories'
      }
    }
  ]);

  if (!stories) return ApiError(next, new Error('No stories found'), req, statusCodes.BAD_REQUEST);

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, stories);
});

export { createNewStory, getSpecificUserStory, getStory };
