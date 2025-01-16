import mongoose, { Document, Model, Schema } from 'mongoose';

interface IFollow extends Document {
  follower: Schema.Types.ObjectId;
  followed: Schema.Types.ObjectId;
}

const followSchema: Schema<IFollow> = new mongoose.Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    followed: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export const Follow: Model<IFollow> = mongoose.model<IFollow>('Follow', followSchema);
