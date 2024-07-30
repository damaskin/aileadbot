import { Request, Response } from 'express';
import { getChatMessages, readChat, getAdvertDataById } from '../services/avitoService';

export const getChats = async (req: Request, res: Response) => {
    const userId = req.query?.user_id ? req.query?.user_id.toString() : '';
    const chat_id = req.query?.chat_id ? req.query?.chat_id.toString() : '';
    try {
        const chats = await getChatMessages(userId, chat_id);
        res.json(chats);
    } catch (error) {
        res.status(500).send('Failed to get chats');
    }
};

export const getChatById = async (req: Request, res: Response) => {
    const { user_id, chat_id } = req.query;
    console.log('req.query = ', req.query);
    try {
        if (typeof user_id === "string" && (typeof chat_id === "string" || !chat_id)) {
            const chat = await getChatMessages(user_id, chat_id);
            res.json(chat);
        }

    } catch (error) {
        res.status(500).send('Failed to get chat');
    }
};

export const readChatAvito = async (req: Request, res: Response) => {
    const { user_id, chat_id } = req.query;
    try {
        if (typeof user_id === "string" && typeof chat_id === "string") {
            const result = await readChat(user_id, chat_id);
            res.json(result);
        }
    } catch (error) {
        res.status(500).send('Failed to mark chat as read');
    }
};


export const getAdvertData = async (req: Request, res: Response) => {
    console.log('req = ', req);
    console.log(22222222);
    const adUrl = req.query.url as string;
    try {
        console.log(3333);
        if (!adUrl) {
            return res.status(400).send('URL is required');
        }
        const result = await getAdvertDataById(adUrl);
        res.json(result);
    } catch (error) {
        res.status(500).send('Failed to mark chat as read');
    }
};
