import { Router } from 'express';
import { createNewPost, getPostById, getPublicPosts } from '../controller/post.controller';
import { upload } from '../middleware/multer.middleware';
import { isLoggedIn } from '../middleware/auth.middleware';

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
router.route('/:postId').get(getPostById);

export default router;
