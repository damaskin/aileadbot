import { Request, Response } from 'express';
import {deleteMessage, sendMessage} from '../services/avitoService';

export const sendMessageAvito = async (req: Request, res: Response) => {
    const { userId, chatId, message } = req.body;
    try {
        const responseData = await sendMessage(userId, chatId, message);
        res.json(responseData);
    } catch (error) {
        res.status(500).send('Failed to send message');
    }
};

export const deleteMessageAvito = async (req: Request, res: Response) => {
    const { user_id, chat_id, message_id } = req.params;
    try {
        const result = await deleteMessage(user_id, chat_id, message_id);
        res.json(result);
    } catch (error) {
        res.status(500).send('Failed to delete message');
    }
};
