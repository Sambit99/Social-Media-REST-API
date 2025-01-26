import { Router } from 'express';
import { createNewStory, getStory } from '../controller/story.controller';
import { isLoggedIn } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer.middleware';

const router = Router();

router.use(isLoggedIn);
router
  .route('/')
  .get(getStory)
  .post(
    upload.fields([
      { name: 'imageFile', maxCount: 1 },
      { name: 'videoFile', maxCount: 1 }
    ]),
    createNewStory
  );

export default router;
