import { Router } from 'express';
import { deleteUser, getCurrentUser, getUserById } from '../controller/user.controller';
import { isLoggedIn } from '../middleware/auth.middleware';
import { toggleFollow } from '../controller/follow.controller';

const router = Router();

router.use(isLoggedIn);
router.route('/self').get(getCurrentUser).delete(deleteUser);
router.route('/:userId').get(getUserById);
router.route('/:userId/follow').post(toggleFollow);
router.route('/:userId/unfollow').delete(toggleFollow);

export default router;
