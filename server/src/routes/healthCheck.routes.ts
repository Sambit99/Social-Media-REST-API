import { Router } from 'express';
import { healthcheck } from '../controller/healthCheck.controllers';

const router = Router();

router.route('/').get(healthcheck);

export default router;
