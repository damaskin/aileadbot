import express, { Request, Response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUrl = process.env.REDIRECT_URL;

let accessToken: string = '';

app.get('/oauth2/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;

    try {
        const response = await axios.post('https://api.avito.ru/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUrl,
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        accessToken = response.data.access_token;
        res.send('Authorization successful! You can close this window.');
    } catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Failed to get access token');
    }
});

app.post('/send-message', async (req: Request, res: Response) => {
    const { chatId, message } = req.body;

    try {
        const response = await axios.post(`https://api.avito.ru/messenger/v1/accounts/me/chats/${chatId}/messages`,
            { text: message },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

        res.send('Message sent successfully');
    } catch (error: any) {
        console.error('Error sending message:', error);
        res.status(500).send('Failed to send message');
    }
});

app.get('/messages/:chatId', async (req: Request, res: Response) => {
    const { chatId } = req.params;

    try {
        const response = await axios.get(`https://api.avito.ru/messenger/v1/accounts/me/chats/${chatId}/messages`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Failed to fetch messages');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
});
