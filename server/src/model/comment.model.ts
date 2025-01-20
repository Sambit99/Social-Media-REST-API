import mongoose, { Document, Model, Schema } from 'mongoose';
import { Post } from './post.model';

export interface IComment extends Document {
  post: Schema.Types.ObjectId;
  commentedBy: Schema.Types.ObjectId;
  content: string;
  likesCount: number;
}

const commentSchema: Schema<IComment> = new mongoose.Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    commentedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    likesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

commentSchema.post('save', async function () {
  if (this.post) {
    const totalCommentsForThePost = await Comment.countDocuments({ post: this.post });

    await Post.findByIdAndUpdate(this.post, { commentsCount: totalCommentsForThePost });
  }
});

commentSchema.post('findOneAndDelete', async function (doc: IComment) {
  if (doc) {
    const totalCommentsForThePost = await Comment.countDocuments({ post: doc.post });

    await Post.findByIdAndUpdate(doc.post, { commentsCount: totalCommentsForThePost });
  }
});

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
