import { Router } from 'express';
import { createUser, getUser, getUsers, listUserChats, logIn } from '../controllers/user.ts';
import { verifyTokenMW } from '../middleware/token.ts';

const router = Router();

router.get('/users', getUsers)
router.post('/users', createUser)
router.get('/auth/users', verifyTokenMW ,getUser)
router.get('/users/:id/chats', listUserChats)
router.post('/users/login', logIn)

export default router;