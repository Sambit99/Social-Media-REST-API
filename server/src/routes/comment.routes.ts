import { Router } from 'express';
import { isLoggedIn, onlyOwner } from '../middleware/auth.middleware';
import { Comment } from '../model/comment.model';
import { deleteComment } from '../controller/comment.controller';

const router = Router();

router.use(isLoggedIn);
router.route('/:commentId').delete(onlyOwner(Comment, 'commentedBy', 'commentId'), deleteComment);

export default router;
