import { Router } from 'express';
import { login, logout, signUp } from '../controller/auth.controller';
import { isLoggedIn } from '../middleware/auth.middleware';

const router = Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/logout').post(isLoggedIn, logout);

export default router;
