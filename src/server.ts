import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: 'sk-proj-g75mwVqL7cc5YqfZ5YnkT3BlbkFJpS4L7awdp2hkL4EGyrys',
});

const ASSISTANT_ID = 'asst_UsKoR3H3Eo9bViCcy3N9lq8g';

app.use(express.json());

let chatThreadMap: { [chatId: string]: string } = {};
let processedMessages = new Set<string>();

app.post('/message-to-openai', async (req: Request, res: Response) => {
    const { chatId, userId, message } = req.body;
    try {
        let threadId = chatThreadMap[chatId];
        if (!threadId) {
            const thread = await openai.beta.threads.create();
            threadId = thread.id;
            chatThreadMap[chatId] = threadId;
        }

        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message,
        });

        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID,
        });

        const checkStatusAndPrintMessages = async (threadId: string, runId: string) => {
            let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
            if (runStatus.status === "completed") {
                let messages = await openai.beta.threads.messages.list(threadId);

                const lastMessage = messages.data[0];
                const role = lastMessage.role;
                const messageId = lastMessage.id;
                const content = (lastMessage.content[0] as any)?.text?.value;

                if (role === 'assistant' && !processedMessages.has(messageId)) {
                    console.log('Отправляем сообщение в Авито.');
                    await sendMessage(userId, chatId, content);
                    processedMessages.add(messageId);
                } else {
                    console.log('Сообщение уже обработано или не является ответом ассистента.');
                }

            } else {
                console.log("Run is not completed yet.");
                setTimeout(() => {
                    checkStatusAndPrintMessages(threadId, run.id);
                }, 1000);
            }
        };

        setTimeout(() => {
            checkStatusAndPrintMessages(threadId, run.id);
        }, 1000);

        res.send('Run initiated, check the console for updates.');
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).send('Error communicating with OpenAI');
    }
});

app.use(bodyParser.json());

const clientId = '-XOzxuvB6yPjDlEbHsS8';
const clientSecret = 'gSpUNQw2irHccNowlP2UUjTrlfWdTpukaK06JzEP';
const redirectUrl = 'https://raynor.a.pinggy.link/';

let accessToken: string = '';

// Функция для получения токена доступа
async function getAccessToken() {
    try {
        const response = await axios.post('https://api.avito.ru/token/', null, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            }
        });

        accessToken = response.data.access_token;
        console.log('Access token obtained:', accessToken);
    } catch (error) {
        console.error('Error getting access token:', error);
    }
}

// Вызов функции для получения токена при запуске сервера
getAccessToken();

// Функция для отправки текстового сообщения
async function sendMessage(userId: number, chatId: string, messageText: string) {
    try {
        const response = await axios.post(`https://api.avito.ru/messenger/v1/accounts/${userId}/chats/${chatId}/messages`,
            {
                message: {
                    text: messageText
                },
                type: "text"
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
    }
}

// Маршрут для отправки сообщения
app.post('/send-message', async (req: Request, res: Response) => {
    const { userId, chatId, message } = req.body;

    try {
        const responseData = await sendMessage(userId, chatId, message);
        res.json(responseData);
    } catch (error) {
        res.status(500).send('Failed to send message');
    }
});

app.get('/dialogs', async (req: Request, res: Response) => {
    try {
        // const response = await axios.get('https://api.avito.ru/messenger/v2/accounts/33426042/chats', {
        // const response = await axios.get('https://api.avito.ru/messenger/v3/accounts/33426042/chats/u2i-mSEzMrUaADO~6ooUN8p9gA/messages/', {
        // const response = await axios.get('https://api.avito.ru/messenger/v3/accounts/33426042/chats/u2i-mSEzMrUaADO~6ooUN8p9gA/messages/', {
        const response = await axios.get('https://api.avito.ru/messenger/v3/accounts/33426042/chats/u2i-mSEzMrUaADO~6ooUN8p9gA/messages/', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching dialogs:', error);
        res.status(500).send('Failed to fetch dialogs');
    }
});

app.post('/register-webhook', async (req: Request, res: Response) => {
    const { url } = req.body;

    try {
        const response = await axios.post('https://api.avito.ru/messenger/v3/webhook',
            { url },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

        res.json(response.data);
    } catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).send('Failed to register webhook');
    }
});

// Функция для получения сообщения из чата
async function getChatMessages(userId: number, chatId: string) {
    try {
        const response = await axios.get(`https://api.avito.ru/messenger/v2/accounts/${userId}/chats/${chatId}/messages/`);

        return response.data;
    } catch (error) {
        console.error('Error getting chat message:', error);
        throw new Error('Failed to get chat message');
    }
}

// Функция для прочтения чата
async function readChat(userId: number, chatId: string) {
    try {
        const response = await axios.post(`https://api.avito.ru/messenger/v1/accounts/${userId}/chats/${chatId}/read`);

        return response.data;
    } catch (error) {
        console.error('Error reading chat:', error);
        throw new Error('Failed to read chat');
    }
}

app.post('/webhook', async (req: Request, res: Response) => {
    const webhookData = req.body;

    console.log('Received webhook:', webhookData);

    if (webhookData.payload?.type === 'message' && webhookData.payload.value.user_id !== webhookData.payload.value.author_id) {
        const messageId = webhookData.payload.value.id;
        if (processedMessages.has(messageId)) {
            console.log(`Message ${messageId} already processed.`);
            return res.status(200).send('OK');
        }

        const chatId = webhookData.payload.value.chat_id;
        const userId = webhookData.payload.value.user_id;

        try {
            const contentText = webhookData.payload.value.content.text;
            await axios.post('https://raynor.a.pinggy.link/message-to-openai',
                { chatId, userId, message: contentText });

            processedMessages.add(messageId);

            res.status(200).send('OK');
        } catch (error: any) {
            console.error('Error processing webhook data:', error.message);
            res.status(500).send('Failed to process webhook data');
        }
    } else {
        res.status(200).send('OK');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
});
