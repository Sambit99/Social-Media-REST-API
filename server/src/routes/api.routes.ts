import { Router } from 'express';
import apiController from '../controller/api.controller';

const router = Router();

router.route('/self').get(apiController.self);

export default router;
