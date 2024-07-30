import { Router } from 'express';
import {  processWebhook } from '../controllers/webhookController';

const router = Router();

// router.post('/register-webhook', registerWebhook);
router.post('/webhook', processWebhook);

export default router;
