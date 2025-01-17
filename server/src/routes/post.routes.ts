import { Router } from 'express';
import { createNewPost } from '../controller/post.controller';
import { upload } from '../middleware/multer.middleware';
import { isLoggedIn } from '../middleware/auth.middleware';

const router = Router();

router.route('/').post(
  isLoggedIn,
  upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 }
  ]),
  createNewPost
);

export default router;
