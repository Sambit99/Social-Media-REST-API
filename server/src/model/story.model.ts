import mongoose, { Document, Model, Schema } from 'mongoose';
import cron from 'node-cron';
import { deleteFromCloudinary } from '../util/Cloudinary';
import Logger from '../util/Logger';
export enum StoryVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CLOSE_FRIENDS = 'close-friends'
}

export interface IStory extends Document {
  storyBy: Schema.Types.ObjectId;
  imageFile: string;
  videoFile: string;
  visibility: string;
  expiresAt: Date;
}

const storySchema: Schema<IStory> = new mongoose.Schema(
  {
    storyBy: { type: Schema.Types.ObjectId, ref: 'User' },
    imageFile: { type: String },
    videoFile: { type: String },
    visibility: { type: String, enum: StoryVisibility, default: StoryVisibility.PUBLIC },
    expiresAt: {
      type: Date,
      required: true,
      default: new Date(Date.now() + 10000)
    }
  },
  { timestamps: true }
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
cron.schedule('*/1 * * * *', async () => {
  const expiredStories: Array<IStory> = await Story.find({ expiresAt: { $lt: new Date(Date.now()) } });

  if (expiredStories) {
    for (const story of expiredStories) {
      if (story.imageFile) await deleteFromCloudinary(story.imageFile, 'image');
      if (story.videoFile) await deleteFromCloudinary(story.videoFile, 'video');

      await Story.findByIdAndDelete(story._id);
    }

    Logger.info('EXPIRED STORIES DELETED');
  }
});

export const Story: Model<IStory> = mongoose.model<IStory>('Story', storySchema);
