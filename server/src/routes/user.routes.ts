import { Router } from 'express';
import { deleteUser, getCurrentUser, getUserById } from '../controller/user.controller';
import { isLoggedIn } from '../middleware/auth.middleware';

const router = Router();

router.use(isLoggedIn);
router.route('/self').get(getCurrentUser).delete(deleteUser);
router.route('/:userId').get(getUserById);

export default router;