import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILike extends Document {
  post: Schema.Types.ObjectId;
  likedBy: Schema.Types.ObjectId;
}

const likeSchema: Schema<ILike> = new mongoose.Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    likedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Like: Model<ILike> = mongoose.model<ILike>('Like', likeSchema);
