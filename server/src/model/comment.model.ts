import mongoose, { Document, Model, Schema } from 'mongoose';

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

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
