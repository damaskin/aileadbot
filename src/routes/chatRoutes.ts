import { Router } from 'express';
import {getChats, getChatById, readChatAvito} from '../controllers/chatController';

const router = Router();

router.get('/', getChats);
router.get('/:chat_id', getChatById);
router.post('/:chat_id/read', readChatAvito);

export default router;
