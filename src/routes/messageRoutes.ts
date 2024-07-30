import { Router } from 'express';
import { sendMessageAvito, deleteMessageAvito } from '../controllers/messageController';

const router = Router();

router.post('/', sendMessageAvito);
router.post('/:message_id', deleteMessageAvito);

export default router;
