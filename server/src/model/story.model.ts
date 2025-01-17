import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStory extends Document {
  storyBy: Schema.Types.ObjectId;
  imageFile: string;
  videoFile: string;
  expiresAt: Date;
}

const storySchema: Schema<IStory> = new mongoose.Schema(
  {
    storyBy: { type: Schema.Types.ObjectId, ref: 'User' },
    imageFile: { type: String },
    videoFile: { type: String },
    expiresAt: {
      type: Date,
      required: true,
      default: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  },
  { timestamps: true }
);

// Note: TTL index for expiresAt
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Story: Model<IStory> = mongoose.model<IStory>('Story', storySchema);
