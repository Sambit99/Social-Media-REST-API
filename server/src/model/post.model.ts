import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPost extends Document {
  owner: Schema.Types.ObjectId;
  content?: string;
  imageFile?: string;
  videoFile?: string;
  visibility: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

const PostVisibility = Object.freeze({
  PUBLIC: 'public',
  PRIVATE: 'private',
  CLOSE_FRIENDS: 'close-friends'
});

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    imageFile: { type: String },
    videoFile: { type: String },
    visibility: {
      type: String,
      enum: Object.values(PostVisibility),
      default: PostVisibility.PRIVATE
    },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);
