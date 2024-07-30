import express, {Request, Response} from 'express';
import OpenAI from 'openai';
import bodyParser from "body-parser";
import axios from "axios";
import {PrismaClient} from '@prisma/client';
import {containsPhoneNumber, sendTelegramMessage} from "./telegramService";

const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: 'sk-proj-g75mwVqL7cc5YqfZ5YnkT3BlbkFJpS4L7awdp2hkL4EGyrys',
});

const ASSISTANT_ID = 'asst_UsKoR3H3Eo9bViCcy3N9lq8g';

const INSTRUCTION = "Роль: Продавец на Авито\n" +
    "Основная задача:\n" +
    "Продавец на Авито должен профессионально продавать конкретные объявления. В зависимости от входящего запроса, он должен понимать контекст объявления, знать о нем все, адаптироваться к необходимой роли и консультировать клиентов. Бот должен просматривать контекст объявления, по которому к нему обратились, чтобы понимать, о чем идет речь.\n" +
    "Поддерживать активный диалог.\n" +
    "Собирать контактные данные клиентов и передавать их в Telegram-бот с кратким описанием разговора.\n" +
    "Характеристики:\n" +
    "Профессионализм и Дружелюбие: Создает доверительную атмосферу.\n" +
    "Внимание к деталям: Учитывает индивидуальные потребности клиентов.\n" +
    "Коммуникационные навыки: Способность четко и вежливо общаться с клиентами.\n" +
    "Эмпатия: Способность понимать и учитывать эмоции и потребности клиента.\n" +
    "Ключевые навыки:\n" +
    "Сегментация клиентов и персонализированный подход: Индивидуальный подход к каждому клиенту.\n" +
    "Способность к дополнительным продажам и перекрестным продажам: Увеличение средней стоимости сделки.\n" +
    "Сбор информации и контактов: Сбор VIN-кодов, наименований товаров, номеров телефонов и другой необходимой информации.\n" +
    "Передача данных: Быстрая и точная передача данных в Telegram-бот.\n" +
    "Основные задачи и функции:\n" +
    "Консультация клиентов: Кратко и по существу отвечать на вопросы клиентов.\n" +
    "Поддержание активного диалога: Удерживать клиента вовлеченным в беседу.\n" +
    "Сбор контактных данных: Запрашивать VIN-коды, наименования товаров, интересоваться дополнительными необходимыми товарами, собирать номера телефонов.\n" +
    "Передача данных: Передавать контактные данные и краткое описание разговора в Telegram-бот.\n" +
    "Важные моменты:\n" +
    "Всегда пишите по-разному!: Варьируйте приветствия и вопросы.\n" +
    "Персонализированный подход: Всегда выбирайте соответствующий стиль общения для каждого клиента.\n" +
    "Активное слушание: Внимательно слушайте клиента и отвечайте на его вопросы.\n" +
    "Запрещено придумывать несуществующие программы или детали.\n" +
    "Своевременная передача данных: Быстро передавать контактные данные и резюме разговора в Telegram-бот.\n" +
    "Ограничения:\n" +
    "Не давайте ложных обещаний и нереалистичных данных: Всегда будьте честны с клиентами.\n" +
    "Для сложных технических вопросов предложите консультацию с менеджером: Не пытайтесь ответить на вопросы, в которых не уверены.\n" +
    "Всегда уточняйте, если не уверены в информации: Лучше спросить, чем дать неправильный ответ.\n" +
    "Не разглашайте конфиденциальные данные других клиентов: Соблюдайте правила конфиденциальности.\n" +
    "Вежливо завершайте разговор, если клиент явно не заинтересован: Не настаивайте, если клиент не заинтересован.\n" +
    "Не упоминайте, что помощник был создан OpenAI: Избегайте любых упоминаний об этом или аналогичных сервисах.\n" +
    "Не обсуждайте темы, не связанные с основным предметом объявления: Оставайтесь в рамках обсуждения объявления.\n" +
    "Не давайте общих деловых советов, не связанных с конкретным объявлением: Фокусируйтесь на специфике текущего обсуждения.\n" +
    "Не адаптируйтесь к желанию клиента писать в чужом стиле: Сохраняйте свой профессиональный стиль.\n" +
    "Не задавайте более одного вопроса в одном сообщении: Держите диалог структурированным и понятным для клиента.\n" +
    "Рабочий процесс:\n" +
    "Приветствуйте клиента и спрашивайте его имя.\n" +
    "\n" +
    "Пример приветствия: \"Здравствуйте! Спасибо, что обратились к нам. Как я могу к вам обращаться?\"\n" +
    "Уточните детали и потребности клиента.\n" +
    "\n" +
    "Вопросы: \"Что конкретно вас интересует в [title]?\", \"Есть ли у вас дополнительные запросы?\"\n" +
    "Консультация о продукте.\n" +
    "\n" +
    "Сбор контактных данных.\n" +
    "\n" +
    "Вопрос 1: \"Пожалуйста, предоставьте ваш VIN-код.\" {проверка VIN-кода}\n" +
    "Вопрос 2: \"Хорошо, кроме [title], нужно ли вам еще что-то проверить?\"\n" +
    "Вопрос 3: \"Понял. Пожалуйста, укажите ваш номер телефона для связи. Я передам ваш запрос менеджеру, который проверит все, что вам нужно, и свяжется для подтверждения заказа.\"\n" +
    "Вопрос 4: {проверка номера телефона} \"Спасибо, пожалуйста, ждите звонка. Могу ли я еще чем-то помочь?\"\n" +
    "Передача данных в Telegram-бот.";


app.use(express.json());

const prisma = new PrismaClient();
let runAssistent: OpenAI.Beta.Threads.Runs.Run;

app.post('/message-to-openai', async (req: Request, res: Response) => {
    const { chatId, userId, message, itemId } = req.body;
    try {
        let chatThread = await prisma.chatThread.findUnique({
            where: { chatId: chatId }
        });

        if (!chatThread) {
            const thread = await openai.beta.threads.create();
            chatThread = await prisma.chatThread.create({
                data: {
                    chatId: chatId,
                    threadId: thread.id,
                    assistantId: '',
                }
            });
        }

        // const activeRun = await getActiveRun(chatThread.threadId);
        // if (activeRun) {
        //     console.log("Active run is not completed yet. Waiting...");
        //     return res.status(400).send("Active run is not completed yet.");
        // }

        await openai.beta.threads.messages.create(chatThread.threadId, {
            role: "user",
            content: message,
        });

        const runAssistent = await openai.beta.threads.runs.create(chatThread.threadId, {
            assistant_id: ASSISTANT_ID,
        });

        await waitForRunCompletion(chatThread.threadId, runAssistent.id);

        let messages = await openai.beta.threads.messages.list(chatThread.threadId);
        const lastMessage = messages.data[0];
        const role = lastMessage.role;
        const messageId = lastMessage.id;
        const content = (lastMessage.content[0] as any)?.text?.value;

        const processedMessage = await prisma.processedMessage.findUnique({
            where: { messageId: messageId }
        });

        if (role === 'assistant' && !processedMessage) {
            await sendMessage(userId, chatId, content);
            await prisma.processedMessage.create({
                data: { messageId: messageId }
            });
        } else {
            console.log('Сообщение уже обработано или не является ответом ассистента.');
        }

        res.send('Run completed and message processed.');
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
export async function getAccessToken() {
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

async function getItemData(userId: number, itemId: number) {
    try {
        if (!accessToken) {
            await getAccessToken();
        }

        // const response = await axios.get(`https://api.avito.ru/core/v1/accounts/${userId}/items/${itemId}`, {
        //     headers: {
        //         Authorization: `Bearer ${accessToken}`
        //     }
        // });
        const response = await axios.get(`https://api.avito.ru/core/v1/items`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const itemData = response.data;
        const { title, price, description, text } = itemData;

        console.log('Title:', title);
        console.log('Price:', price);
        console.log('Description:', description);
        console.log('Text:', text);

        return itemData;
    } catch (error) {
        console.error('Error getting item data:', error);
        throw new Error('Failed to get item data');
    }
}

// Вызов функции для получения токена при запуске сервера
// getAccessToken();

// Функция для отправки текстового сообщения
export async function sendMessage(userId: number, chatId: string, messageText: string) {
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
export async function getChatMessages(userId: string | undefined, chatId: string | undefined) {
    //https://api.avito.ru/messenger/v3/accounts/{user_id}/chats/{chat_id}/messages/
    try {
        const response = await axios.get(`https://api.avito.ru/messenger/v3/accounts/${userId}/chats/${chatId}/messages/?limit=4&offset=0`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting chat message:', error);
        throw new Error('Failed to get chat message');
    }
}

// Функция для получения информации о чате
export async function getChatMessagesById(userId: string | undefined, chatId: string | undefined) {
    //https://api.avito.ru/messenger/v3/accounts/{user_id}/chats/{chat_id}/messages/
    try {
        const response = await axios.get(`https://api.avito.ru/messenger/v2/accounts/${userId}/chats/${chatId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting chat message:', error);
        throw new Error('Failed to get chat message');
    }
}

// Функция для прочтения чата
export async function readChat(userId: string, chatId: string) {
    try {
        const response = await axios.post(`https://api.avito.ru/messenger/v1/accounts/${userId}/chats/${chatId}/read`);

        return response.data;
    } catch (error) {
        console.error('Error reading chat:', error);
        throw new Error('Failed to read chat');
    }
}

export async function registerWebhook(url: string) {
    try {
        const response = await axios.post('https://api.avito.ru/messenger/v3/webhook',
            { url },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

        return response.data;
    } catch (error) {
        console.error('Error registering webhook:', error);
        throw new Error('Failed to register webhook');
    }
}

export async function processWebhook(webhookData: any) {
    if (webhookData.payload?.type === 'message' && webhookData.payload.value.user_id !== webhookData.payload.value.author_id) {
        const messageId = webhookData.payload.value.id;
        const processedMessage = await prisma.processedMessage.findUnique({
            where: { messageId: messageId }
        });

        if (processedMessage || webhookData.payload.value.author_id === 1) {
            console.log(`Message ${messageId} already processed.`);
            return;
        }

        const chatId = webhookData.payload.value.chat_id;
        const userId = webhookData.payload.value.user_id;
        const itemId = webhookData.payload.value.item_id;

        const chatMessages = await getChatMessagesById(userId, chatId);
        console.log('chatMessages = ', chatMessages);

        try {
            const contentText = webhookData.payload.value.content.text;

            await handleMessageToOpenAI(chatId, userId, contentText, false, null, chatMessages.context);

            setTimeout(async () => {
                const phoneNumber = containsPhoneNumber(contentText);
                console.log('phoneNumber = ', phoneNumber);
                if (phoneNumber) {
                    const messageForOpenAI = 'Напиши краткое содержание даилога';
                    await handleMessageToOpenAI(chatId, userId, messageForOpenAI, true, phoneNumber, chatMessages.context);

                }
            }, 10000);

            await prisma.processedMessage.create({
                data: { messageId: messageId }
            });
        } catch (error: any) {
            console.error('Error processing webhook data:', error.message);
            throw new Error('Failed to process webhook data');
        }
    }
}

// export async function processWebhook(req: Request, res: Response) {
//     const webhookData = req.body;
//     console.log('webhookData = ', webhookData);
//
//     if (webhookData.payload?.type === 'message' && webhookData.payload.value.user_id !== webhookData.payload.value.author_id) {
//         const messageId = webhookData.payload.value.id;
//
//         const processedMessage = await prisma.processedMessage.findUnique({
//             where: { messageId: messageId }
//         });
//
//         if (processedMessage) {
//             console.log(`Message ${messageId} already processed.`);
//             return res.status(200).send('OK');
//         }
//
//         const chatId = webhookData.payload.value.chat_id;
//         const userId = webhookData.payload.value.user_id;
//
//         try {
//             const contentText = webhookData.payload.value.content.text;
//             console.log('contentText = ', contentText);
//
//             const phoneNumber = containsPhoneNumber(contentText);
//             if (phoneNumber) {
//                 const chatMessages = await getChatMessages(userId, chatId);
//                 const lastTwoMessages = chatMessages.slice(-2).map((msg: any) => msg.content.text).join('\n');
//                 const avitoLink = `https://www.avito.ru/items/${chatId}`;
//                 const telegramMessage = `Имя клиента: ${userId}\nНомер телефона: ${phoneNumber}\nСсылка на объявление: ${avitoLink}\nПоследние 2 сообщения:\n${lastTwoMessages}`;
//
//                 await sendTelegramMessage(telegramMessage);
//             }
//
//             await prisma.processedMessage.create({
//                 data: { messageId: messageId }
//             });
//
//             return res.status(200).send('OK');
//         } catch (error: any) {
//             console.error('Error processing webhook data:', error.message);
//             return res.status(500).send('Failed to process webhook data');
//         }
//     } else {
//         return res.status(200).send('OK');
//     }
// }

app.post('/webhook', async (req: Request, res: Response) => {
    const webhookData = req.body;

    console.log('Received webhook:', webhookData);

    if (webhookData.payload?.type === 'message' && webhookData.payload.value.user_id !== webhookData.payload.value.author_id) {
        const messageId = webhookData.payload.value.id;

        const processedMessage = await prisma.processedMessage.findUnique({
            where: { messageId: messageId }
        });

        if (processedMessage) {
            console.log(`Message ${messageId} already processed.`);
            return res.status(200).send('OK');
        }

        const chatId = webhookData.payload.value.chat_id;
        const userId = webhookData.payload.value.user_id;
        const itemId = webhookData.payload.value.item_id;

        try {
            const contentText = webhookData.payload.value.content.text;
            await axios.post('https://raynor.a.pinggy.link/message-to-openai',
                { chatId, userId, message: contentText, itemId });

            await prisma.processedMessage.create({
                data: { messageId: messageId }
            });

            res.status(200).send('OK');
        } catch (error: any) {
            console.error('Error processing webhook data:', error.message);
            res.status(500).send('Failed to process webhook data');
        }
    } else {
        res.status(200).send('OK');
    }
});

export async function deleteMessage(userId: string, chatId: string, messageId: string) {
    try {
        const response = await axios.post(`https://api.avito.ru/messenger/v1/accounts/${userId}/chats/${chatId}/messages/${messageId}`, null, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error('Failed to delete message');
    }
}

export async function handleMessageToOpenAI(chatId: string, userId: number, message: string, isDialogInfo: boolean, phoneNumber: string | null, contextItem: any) {
    try {
        let chatThread = await prisma.chatThread.findUnique({
            where: { chatId: chatId }
        });

        let threadId: string;
        let assistantId: string;

        if (chatThread) {
            threadId = chatThread.threadId;
            assistantId = chatThread.assistantId;
        } else {
            const thread = await openai.beta.threads.create();
            // const advert = await getItemData(userId, itemId);
            const contextItemMessage =
                INSTRUCTION.replace('[title]', contextItem.value.title).replace('[title]', contextItem.value.title)
                + `Информация об объявлении о котором ты должен знать ${JSON.stringify(contextItem)}`;

            console.log('contextItemMessage = ', contextItemMessage);

            const assistant = await openai.beta.assistants.create({
                name: "Custom Assistant",
                instructions: contextItemMessage,
                model: "gpt-4-1106-preview",
            });

            threadId = thread.id;
            assistantId = assistant.id;

            await prisma.chatThread.create({
                data: {
                    chatId: chatId,
                    threadId: threadId,
                    assistantId: assistantId,
                }
            });
        }

        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message,
        });

        const runAssistent = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
        });

        await waitForRunCompletion(threadId, runAssistent.id);

        const checkStatusAndPrintMessages = async (threadId: string, runId: string) => {
            let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
            console.log(runStatus.instructions);
            if (runStatus.status === "completed") {
                let messages = await openai.beta.threads.messages.list(threadId);

                const lastMessage = messages.data[0];
                const role = lastMessage.role;
                const messageId = lastMessage.id;
                const content = (lastMessage.content[0] as any)?.text?.value;

                if (isDialogInfo) {
                    const messageFromOpenAi = (lastMessage.content[0] as any)?.text?.value;
                    const avitoLink = `https://www.avito.ru/profile/messenger/channel/${chatId}`;
                    const telegramMessage = `Имя клиента: ${userId}\nНомер телефона: ${phoneNumber}\nСсылка на объявление: ${avitoLink}\nКраткое содержание диалога:\n${messageFromOpenAi}`;

                    await sendTelegramMessage(telegramMessage);
                } else {
                    const processedMessage = await prisma.processedMessage.findUnique({
                        where: { messageId: messageId }
                    });

                    if (role === 'assistant' && !processedMessage) {
                        console.log('Отправляем сообщение в Авито.');
                        await sendMessage(userId, chatId, content);
                        await prisma.processedMessage.create({
                            data: { messageId: messageId }
                        });
                    } else {
                        console.log('Сообщение уже обработано или не является ответом ассистента.');
                    }
                }

            } else {
                console.log("Run is not completed yet.");
                setTimeout(() => {
                    checkStatusAndPrintMessages(threadId, runAssistent.id);
                }, 2000);
            }
        };

        setTimeout(() => {
            checkStatusAndPrintMessages(threadId, runAssistent.id);
        }, 2000);

    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        throw new Error('Error communicating with OpenAI');
    }
}

async function waitForAssistantReady(assistantId: string) {
    while (true) {
        const assistantStatus = await openai.beta.assistants.retrieve(assistantId);
        // console.log(assistantStatus.instructions);
        if (assistantStatus) {
            console.log("Assistant is ready");
            break;
        }
        console.log("Waiting for assistant to be ready...");
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function waitForRunCompletion(threadId: string, runId: string) {
    while (true) {
        const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
        if (runStatus.status === "completed") {
            console.log("Run completed");
            break;
        }
        console.log("Waiting 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

export async function getAdvertDataById(adUrl: string) {
    console.log(111111111);
    try {
        const { data } = await axios.get(adUrl);
        console.log('data = ', data);
        // const $ = cheerio.load(data);
        //
        // const title = $('span.title-info-title-text').text();
        // const price = $('span.js-item-price').attr('content');
        // const description = $('div.item-description-text').text().trim();
        // const seller = $('div.seller-info-name a').text().trim();
        // const sellerProfileUrl = $('div.seller-info-name a').attr('href');
        //
        // const adInfo = {
        //     title,
        //     price,
        //     description,
        //     seller,
        //     sellerProfileUrl,
        // };
        return data;

    } catch (error) {
        console.error('Error fetching the ad info:', error);
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
});
