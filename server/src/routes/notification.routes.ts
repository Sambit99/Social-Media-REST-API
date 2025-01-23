import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware';
import { getUserNotifications } from '../controller/notification.controller';

const router = Router();

router.use(isLoggedIn);
router.route('/self').get(getUserNotifications);

export default router;
