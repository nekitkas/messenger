import { Router } from 'express';
import { newMessage, listChatMessages } from '../controllers/message.ts';

const router = Router();

router.post('/messages', newMessage)
router.get('/messages/:id', listChatMessages)

export default router;