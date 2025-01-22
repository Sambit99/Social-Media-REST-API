import mongoose, { Document, Model, Schema } from 'mongoose';

export enum NOTIFICATION_TYPES {
  POST = 'post',
  COMMENT = 'comment',
  LIKE = 'like'
}

interface INotification extends Document {
  from: Schema.Types.ObjectId;
  to: Schema.Types.ObjectId;
  type: string;
  isRead: boolean;
  content: string;
  resourceId: string;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: NOTIFICATION_TYPES },
    isRead: { type: Boolean, default: false },
    content: { type: String, required: true },

    // Note: Resource Id holds the UID of corresponding record
    // Note: In case of a new Post it'll hold the Post UID
    // Note: In case of a new Comment it'll hold the Comment UID
    // Note: In case of a new LIKE it'll hold the LIKE UID
    resourceId: { type: String, required: true }
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
