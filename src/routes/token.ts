import { Router } from 'express';
import { refreshToken } from '../controllers/token.ts';

const router = Router();

router.get('/auth/refresh-token', refreshToken);

export default router;