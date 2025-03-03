import { Router } from 'express';
import { changeCurrentPassword, login, logout, refreshAccessToken, signUp } from '../controller/auth.controller';
import { isLoggedIn } from '../middleware/auth.middleware';

const router = Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/logout').post(isLoggedIn, logout);
router.route('/refresh').post(refreshAccessToken);
router.route('/update-password').post(isLoggedIn, changeCurrentPassword);

export default router;
