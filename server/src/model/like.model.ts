import mongoose, { Document, Model, Schema } from 'mongoose';
import { Post } from './post.model';
import { Comment } from './comment.model';

export interface ILike extends Document {
  post: Schema.Types.ObjectId;
  comment: Schema.Types.ObjectId;
  likedBy: Schema.Types.ObjectId;
}

const likeSchema: Schema<ILike> = new mongoose.Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    likedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

likeSchema.post('save', async function () {
  if (this.post) {
    const totalLikesForThePost: number = await Like.countDocuments({ post: this.post });

    await Post.findByIdAndUpdate(this.post, { likesCount: totalLikesForThePost });
  }

  if (this.comment) {
    const totalLikesForTheComment: number = await Like.countDocuments({ comment: this.comment });

    await Comment.findByIdAndUpdate(this.comment, { likesCount: totalLikesForTheComment });
  }
});

likeSchema.post('findOneAndDelete', async function (doc: ILike) {
  if (doc) {
    if (doc.post) {
      const totalLikesForThePost: number = await Like.countDocuments({ post: doc.post });
      await Post.findByIdAndUpdate(doc.post, { likesCount: totalLikesForThePost });
    }

    if (doc.comment) {
      const totalLikesForTheComment: number = await Like.countDocuments({ comment: doc.comment });
      await Comment.findByIdAndUpdate(doc.comment, { likesCount: totalLikesForTheComment });
    }
  }
});

export const Like: Model<ILike> = mongoose.model<ILike>('Like', likeSchema);
