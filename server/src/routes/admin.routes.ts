import { Router } from 'express';
import { isLoggedIn, restrictTo } from '../middleware/auth.middleware';
import { getAllUsers } from '../controller/user.controller';

const router = Router();

router.use(isLoggedIn);

router.use(restrictTo('admin'));

router.route('/users').get(getAllUsers);

export default router;
