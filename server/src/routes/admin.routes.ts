import { Router } from 'express';
import { isLoggedIn, restrictTo } from '../middleware/auth.middleware';
import { deleteUserById, getAllUsers, getUserById } from '../controller/user.controller';

const router = Router();

router.use(isLoggedIn);

router.use(restrictTo('admin'));

router.route('/users').get(getAllUsers);
router.route('/user/:userId').get(getUserById).delete(deleteUserById);

export default router;
