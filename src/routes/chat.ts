import { Router } from 'express';
import { newChat, getChat, getChats, joinChat, listChatMembers } from '../controllers/chat.ts';

const router = Router();

router.get('/chats', getChats)
router.post('/chats', newChat)
router.get('/chats/:id', getChat)
router.post('/chats/join', joinChat)
router.get('/chats/:id/members', listChatMembers)

export default router;