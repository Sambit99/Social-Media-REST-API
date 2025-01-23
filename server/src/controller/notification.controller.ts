import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../util/AsyncHandler';
import { IUser } from '../model/user.model';
import { Notification } from '../model/notification.model';
import { Types } from 'mongoose';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import ApiResponse from '../util/ApiResponse';
import responseMessage from '../constant/responseMessage';

interface AuthenticatedRequest extends Request {
  user: IUser;
}

const getUserNotifications = AsyncHandler(async (req: AuthenticatedRequest, res: Response, _: NextFunction) => {
  const userId = req.user._id;

  const userNotifications = await Notification.aggregate([
    {
      $match: {
        to: new Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: '$to',
        notifications: { $addToSet: '$_id' },
        totalNotifications: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'notifications',
        localField: 'notifications',
        foreignField: '_id',
        as: 'notifications',
        pipeline: [
          { $sort: { createdAt: -1 } },
          {
            $project: {
              to: 0
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'to',
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              _id: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        notifications: 1,
        totalNotifications: 1,
        to: 1
      }
    }
  ]);

  res.status(200).json(userNotifications);
});

const readNotification = AsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const notificationId = req.params.notificationId;

  const notification = await Notification.findOne({ _id: notificationId, isRead: false });

  if (!notification)
    return ApiError(next, new Error('Notification not found or already read'), req, statusCodes.BAD_REQUEST);

  notification.isRead = true;
  await notification.save();

  return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, notification);
});

export { getUserNotifications, readNotification };
