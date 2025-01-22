import { Types } from 'mongoose';
import { Notification, NOTIFICATION_TYPES } from '../model/notification.model';
import { Follow } from '../model/follow.model';

interface User {
  _id: string;
  username: string;
  fullname: string;
  email: string;
}
interface FollowerGroup {
  followers: User[];
  totalFollowers: number;
  followed: User[];
}

const createNewPostNotification = async (
  from: string,
  type: NOTIFICATION_TYPES,
  content: string,
  resourceId: string
) => {
  try {
    const userFollowers: FollowerGroup[] = await Follow.aggregate([
      { $match: { followed: new Types.ObjectId(from) } },
      {
        $group: {
          _id: '$followed',
          followers: { $addToSet: '$follower' },
          totalFollowers: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'followers',
          foreignField: '_id',
          as: 'followers',
          pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'followed',
          pipeline: [{ $project: { username: 1, fullname: 1, email: 1 } }]
        }
      },
      {
        $project: { _id: 0, followed: 1, followers: 1, totalFollowers: 1 }
      }
    ]);

    if (userFollowers && userFollowers[0]?.followers) {
      for (const follower of userFollowers[0].followers) {
        await Notification.create({
          from: new Types.ObjectId(from),
          to: new Types.ObjectId(follower._id),
          type,
          content,
          resourceId
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

export { createNewPostNotification };
