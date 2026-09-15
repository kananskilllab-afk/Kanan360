import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, globalSearch);

export default router;
