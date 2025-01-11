import { Router } from 'express';
import { healthcheck } from '../controller/healthCheck.controller';

const router = Router();

router.route('/').get(healthcheck);

export default router;
