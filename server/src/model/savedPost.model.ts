import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISavedPost extends Document {
  post: Schema.Types.ObjectId;
  savedBy: Schema.Types.ObjectId;
}

const savedPostSchema: Schema<ISavedPost> = new mongoose.Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const SavedPost: Model<ISavedPost> = mongoose.model<ISavedPost>('SavedPost', savedPostSchema);
