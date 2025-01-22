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
    resourceId: { type: String, required: true }
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
