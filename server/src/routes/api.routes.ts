import { Router } from 'express';
import apiController from '../controller/api.controller';
import rateLimit from '../middleware/rateLimit';

const router = Router();

router.use(rateLimit);
router.route('/').get(apiController.self);
router.route('/self').get(apiController.self);
router.route('/health').get(apiController.health);

export default router;
