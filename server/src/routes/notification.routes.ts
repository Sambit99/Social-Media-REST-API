import { Router } from 'express';
import { isLoggedIn, onlyOwner } from '../middleware/auth.middleware';
import { getUserNotifications, readNotification } from '../controller/notification.controller';
import { Notification } from '../model/notification.model';

const router = Router();

router.use(isLoggedIn);
router.route('/self').get(getUserNotifications);
router.route('/:notificationId/read').patch(onlyOwner(Notification, 'to', 'notificationId'), readNotification);

export default router;
