import { Router } from 'express';
import { isLoggedIn, onlyOwner } from '../middleware/auth.middleware';
import { deleteNotification, getUserNotifications, readNotification } from '../controller/notification.controller';
import { Notification } from '../model/notification.model';

const router = Router();

router.use(isLoggedIn);
router.route('/self').get(getUserNotifications);
router.route('/:notificationId/read').patch(onlyOwner(Notification, 'to', 'notificationId'), readNotification);
router.route('/:notificationId').delete(onlyOwner(Notification, 'to', 'notificationId'), deleteNotification);

export default router;
