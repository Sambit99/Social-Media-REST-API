import { Router } from 'express';
import { createNewStory, deleteStory, getStory } from '../controller/story.controller';
import { isLoggedIn, onlyOwner } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer.middleware';
import { Story } from '../model/story.model';

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

router.route('/:storyId').delete(onlyOwner(Story, 'storyBy', 'storyId'), deleteStory);

export default router;
