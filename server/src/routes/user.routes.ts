import { Router } from 'express';
import { deleteUser, getCurrentUser, getUserById } from '../controller/user.controller';
import { isLoggedIn } from '../middleware/auth.middleware';
import { getFollowers, getFollowing, toggleFollow } from '../controller/follow.controller';
import { getSpecificUserPosts } from '../controller/post.controller';

const router = Router();

router.use(isLoggedIn);
router.route('/self').get(getCurrentUser).delete(deleteUser);
router.route('/:userId').get(getUserById);
router.route('/:userId/follow').post(toggleFollow);
router.route('/:userId/followers').get(getFollowers);
router.route('/:userId/following').get(getFollowing);
router.route('/:userId/unfollow').delete(toggleFollow);
router.route('/:userId/posts').get(getSpecificUserPosts);

export default router;
