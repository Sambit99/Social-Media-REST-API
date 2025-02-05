import { Router } from 'express';
import { isLoggedIn, restrictTo } from '../middleware/auth.middleware';
import { deleteUserById, getAllUsers, getUserById } from '../controller/user.controller';
import { deletePostById, getAllPosts, getPostById } from '../controller/post.controller';

const router = Router();

router.use(isLoggedIn);

router.use(restrictTo('admin'));

router.route('/users').get(getAllUsers);
router.route('/posts').get(getAllPosts);
router.route('/user/:userId').get(getUserById).delete(deleteUserById);
router.route('/post/:postId').get(getPostById).delete(deletePostById);

export default router;
