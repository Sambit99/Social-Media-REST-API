import mongoose, { Schema } from 'mongoose';

const followSchema = new mongoose.Schema(
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

export const Follow = mongoose.model('Follow', followSchema);
