import mongoose, { Schema } from 'mongoose';

const PostVisibility = Object.freeze({
  PUBLIC: 'public',
  PRIVATE: 'private',
  CLOSE_FRIENDS: 'close-friends'
});

const postSchema = new mongoose.Schema(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
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

export const Post = mongoose.model('Post', postSchema);
