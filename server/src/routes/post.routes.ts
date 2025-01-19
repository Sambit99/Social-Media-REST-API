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

export default router;
