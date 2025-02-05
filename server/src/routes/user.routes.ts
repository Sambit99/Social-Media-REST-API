import { Router } from 'express';
import { deleteUser, getCurrentUser, getUserById } from '../controller/user.controller';
import { isLoggedIn } from '../middleware/auth.middleware';
import { followUser, getFollowers, getFollowing, unFollowUser } from '../controller/follow.controller';
import { getSpecificUserPosts } from '../controller/post.controller';
import { getLikedPosts } from '../controller/like.controller';
import { getSpecificUserStory } from '../controller/story.controller';

const router = Router();

router.use(isLoggedIn);
router.route('/self').get(getCurrentUser).delete(deleteUser);
router.route('/:userId').get(getUserById);
router.route('/:userId/follow').post(followUser);
router.route('/:userId/followers').get(getFollowers);
router.route('/:userId/following').get(getFollowing);
router.route('/:userId/unfollow').delete(unFollowUser);
router.route('/:userId/posts').get(getSpecificUserPosts);
router.route('/:userId/liked-posts').get(getLikedPosts);
router.route('/:userId/stories').get(getSpecificUserStory);

export default router;
