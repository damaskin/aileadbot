import { Request, Response } from 'express';
import { registerWebhook as registerWebhookService, processWebhook as processWebhookService } from '../services/avitoService';

export const registerWebhook = async (req: Request, res: Response) => {
    const { url } = req.body;
    try {
        const response = await registerWebhookService(url);
        res.json(response);
    } catch (error) {
        res.status(500).send('Failed to register webhook');
    }
};

export const processWebhook = async (req: Request, res: Response) => {
    const webhookData = req.body;

    console.log('Received webhook:', webhookData);
    try {
        await processWebhookService(webhookData);
        res.status(200).send('OK');
    } catch (error) {
        res.status(500).send('Failed to process webhook data');
    }
};
