import { Router } from 'express';
import {
  createNewPost,
  deletePostById,
  getPostById,
  getPublicPosts,
  updatePostById
} from '../controller/post.controller';
import { upload } from '../middleware/multer.middleware';
import { isLoggedIn, onlyOwner } from '../middleware/auth.middleware';
import { Post } from '../model/post.model';
import { getPostLikes, togglePostLike } from '../controller/like.controller';
import { createNewComment, getAllPostComments } from '../controller/comment.controller';

const router = Router();

router.route('/').get(getPublicPosts);

router.use(isLoggedIn);
router.route('/').post(
  upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 }
  ]),
  createNewPost
);
router
  .route('/:postId')
  .get(getPostById)
  .patch(onlyOwner(Post, 'owner', 'postId'), updatePostById)
  .delete(onlyOwner(Post, 'owner', 'postId'), deletePostById);

router.route('/:postId/like').post(togglePostLike);
router.route('/:postId/likes').get(getPostLikes);

router.route('/:postId/comment').post(createNewComment);
router.route('/:postId/comments').get(getAllPostComments);

export default router;
