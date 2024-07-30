"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
exports.sendMessage = sendMessage;
exports.getChatMessages = getChatMessages;
exports.getChatMessagesById = getChatMessagesById;
exports.readChat = readChat;
exports.registerWebhook = registerWebhook;
exports.processWebhook = processWebhook;
exports.deleteMessage = deleteMessage;
exports.handleMessageToOpenAI = handleMessageToOpenAI;
exports.getAdvertDataById = getAdvertDataById;
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const body_parser_1 = __importDefault(require("body-parser"));
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const telegramService_1 = require("./telegramService");
const app = (0, express_1.default)();
const port = 3000;
const openai = new openai_1.default({
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
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
let runAssistent;
app.post('/message-to-openai', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { chatId, userId, message, itemId } = req.body;
    try {
        let chatThread = yield prisma.chatThread.findUnique({
            where: { chatId: chatId }
        });
        if (!chatThread) {
            const thread = yield openai.beta.threads.create();
            chatThread = yield prisma.chatThread.create({
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
        yield openai.beta.threads.messages.create(chatThread.threadId, {
            role: "user",
            content: message,
        });
        const runAssistent = yield openai.beta.threads.runs.create(chatThread.threadId, {
            assistant_id: ASSISTANT_ID,
        });
        yield waitForRunCompletion(chatThread.threadId, runAssistent.id);
        let messages = yield openai.beta.threads.messages.list(chatThread.threadId);
        const lastMessage = messages.data[0];
        const role = lastMessage.role;
        const messageId = lastMessage.id;
        const content = (_b = (_a = lastMessage.content[0]) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.value;
        const processedMessage = yield prisma.processedMessage.findUnique({
            where: { messageId: messageId }
        });
        if (role === 'assistant' && !processedMessage) {
            yield sendMessage(userId, chatId, content);
            yield prisma.processedMessage.create({
                data: { messageId: messageId }
            });
        }
        else {
            console.log('Сообщение уже обработано или не является ответом ассистента.');
        }
        res.send('Run completed and message processed.');
    }
    catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).send('Error communicating with OpenAI');
    }
}));
app.use(body_parser_1.default.json());
const clientId = '-XOzxuvB6yPjDlEbHsS8';
const clientSecret = 'gSpUNQw2irHccNowlP2UUjTrlfWdTpukaK06JzEP';
const redirectUrl = 'https://raynor.a.pinggy.link/';
let accessToken = '';
// Функция для получения токена доступа
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post('https://api.avito.ru/token/', null, {
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
        }
        catch (error) {
            console.error('Error getting access token:', error);
        }
    });
}
function getItemData(userId, itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!accessToken) {
                yield getAccessToken();
            }
            // const response = await axios.get(`https://api.avito.ru/core/v1/accounts/${userId}/items/${itemId}`, {
            //     headers: {
            //         Authorization: `Bearer ${accessToken}`
            //     }
            // });
            const response = yield axios_1.default.get(`https://api.avito.ru/core/v1/items`, {
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
        }
        catch (error) {
            console.error('Error getting item data:', error);
            throw new Error('Failed to get item data');
        }
    });
}
// Вызов функции для получения токена при запуске сервера
// getAccessToken();
// Функция для отправки текстового сообщения
function sendMessage(userId, chatId, messageText) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`https://api.avito.ru/messenger/v1/accounts/${userId}/chats/${chatId}/messages`, {
                message: {
                    text: messageText
                },
                type: "text"
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error sending message:', error);
            throw new Error('Failed to send message');
        }
    });
}
// Маршрут для отправки сообщения
app.post('/send-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, chatId, message } = req.body;
    try {
        const responseData = yield sendMessage(userId, chatId, message);
        res.json(responseData);
    }
    catch (error) {
        res.status(500).send('Failed to send message');
    }
}));
app.get('/dialogs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://api.avito.ru/messenger/v3/accounts/33426042/chats/u2i-mSEzMrUaADO~6ooUN8p9gA/messages/', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching dialogs:', error);
        res.status(500).send('Failed to fetch dialogs');
    }
}));
app.post('/register-webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    try {
        const response = yield axios_1.default.post('https://api.avito.ru/messenger/v3/webhook', { url }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).send('Failed to register webhook');
    }
}));
// Функция для получения сообщения из чата
function getChatMessages(userId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        //https://api.avito.ru/messenger/v3/accounts/{user_id}/chats/{chat_id}/messages/
        try {
            const response = yield axios_1.default.get(`https://api.avito.ru/messenger/v3/accounts/${userId}/chats/${chatId}/messages/?limit=4&offset=0`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error getting chat message:', error);
            throw new Error('Failed to get chat message');
        }
    });
}
// Функция для получения информации о чате
function getChatMessagesById(userId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        //https://api.avito.ru/messenger/v3/accounts/{user_id}/chats/{chat_id}/messages/
        try {
            const response = yield axios_1.default.get(`https://api.avito.ru/messenger/v2/accounts/${userId}/chats/${chatId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error getting chat message:', error);
            throw new Error('Failed to get chat message');
        }
    });
}
// Функция для прочтения чата
function readChat(userId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`https://api.avito.ru/messenger/v1/accounts/${userId}/chats/${chatId}/read`);
            return response.data;
        }
        catch (error) {
            console.error('Error reading chat:', error);
            throw new Error('Failed to read chat');
        }
    });
}
function registerWebhook(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post('https://api.avito.ru/messenger/v3/webhook', { url }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error registering webhook:', error);
            throw new Error('Failed to register webhook');
        }
    });
}
function processWebhook(webhookData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (((_a = webhookData.payload) === null || _a === void 0 ? void 0 : _a.type) === 'message' && webhookData.payload.value.user_id !== webhookData.payload.value.author_id) {
            const messageId = webhookData.payload.value.id;
            const processedMessage = yield prisma.processedMessage.findUnique({
                where: { messageId: messageId }
            });
            if (processedMessage || webhookData.payload.value.author_id === 1) {
                console.log(`Message ${messageId} already processed.`);
                return;
            }
            const chatId = webhookData.payload.value.chat_id;
            const userId = webhookData.payload.value.user_id;
            const itemId = webhookData.payload.value.item_id;
            const chatMessages = yield getChatMessagesById(userId, chatId);
            console.log('chatMessages = ', chatMessages);
            try {
                const contentText = webhookData.payload.value.content.text;
                yield handleMessageToOpenAI(chatId, userId, contentText, false, null, chatMessages.context);
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    const phoneNumber = (0, telegramService_1.containsPhoneNumber)(contentText);
                    console.log('phoneNumber = ', phoneNumber);
                    if (phoneNumber) {
                        const messageForOpenAI = 'Напиши краткое содержание даилога';
                        yield handleMessageToOpenAI(chatId, userId, messageForOpenAI, true, phoneNumber, chatMessages.context);
                    }
                }), 10000);
                yield prisma.processedMessage.create({
                    data: { messageId: messageId }
                });
            }
            catch (error) {
                console.error('Error processing webhook data:', error.message);
                throw new Error('Failed to process webhook data');
            }
        }
    });
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
app.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const webhookData = req.body;
    console.log('Received webhook:', webhookData);
    if (((_a = webhookData.payload) === null || _a === void 0 ? void 0 : _a.type) === 'message' && webhookData.payload.value.user_id !== webhookData.payload.value.author_id) {
        const messageId = webhookData.payload.value.id;
        const processedMessage = yield prisma.processedMessage.findUnique({
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
            yield axios_1.default.post('https://raynor.a.pinggy.link/message-to-openai', { chatId, userId, message: contentText, itemId });
            yield prisma.processedMessage.create({
                data: { messageId: messageId }
            });
            res.status(200).send('OK');
        }
        catch (error) {
            console.error('Error processing webhook data:', error.message);
            res.status(500).send('Failed to process webhook data');
        }
    }
    else {
        res.status(200).send('OK');
    }
}));
function deleteMessage(userId, chatId, messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`https://api.avito.ru/messenger/v1/accounts/${userId}/chats/${chatId}/messages/${messageId}`, null, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error deleting message:', error);
            throw new Error('Failed to delete message');
        }
    });
}
function handleMessageToOpenAI(chatId, userId, message, isDialogInfo, phoneNumber, contextItem) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let chatThread = yield prisma.chatThread.findUnique({
                where: { chatId: chatId }
            });
            let threadId;
            let assistantId;
            if (chatThread) {
                threadId = chatThread.threadId;
                assistantId = chatThread.assistantId;
            }
            else {
                const thread = yield openai.beta.threads.create();
                // const advert = await getItemData(userId, itemId);
                const contextItemMessage = INSTRUCTION.replace('[title]', contextItem.value.title).replace('[title]', contextItem.value.title)
                    + `Информация об объявлении о котором ты должен знать ${JSON.stringify(contextItem)}`;
                console.log('contextItemMessage = ', contextItemMessage);
                const assistant = yield openai.beta.assistants.create({
                    name: "Custom Assistant",
                    instructions: contextItemMessage,
                    model: "gpt-4-1106-preview",
                });
                threadId = thread.id;
                assistantId = assistant.id;
                yield prisma.chatThread.create({
                    data: {
                        chatId: chatId,
                        threadId: threadId,
                        assistantId: assistantId,
                    }
                });
            }
            yield openai.beta.threads.messages.create(threadId, {
                role: "user",
                content: message,
            });
            const runAssistent = yield openai.beta.threads.runs.create(threadId, {
                assistant_id: assistantId,
            });
            yield waitForRunCompletion(threadId, runAssistent.id);
            const checkStatusAndPrintMessages = (threadId, runId) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                let runStatus = yield openai.beta.threads.runs.retrieve(threadId, runId);
                console.log(runStatus.instructions);
                if (runStatus.status === "completed") {
                    let messages = yield openai.beta.threads.messages.list(threadId);
                    const lastMessage = messages.data[0];
                    const role = lastMessage.role;
                    const messageId = lastMessage.id;
                    const content = (_b = (_a = lastMessage.content[0]) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.value;
                    if (isDialogInfo) {
                        const messageFromOpenAi = (_d = (_c = lastMessage.content[0]) === null || _c === void 0 ? void 0 : _c.text) === null || _d === void 0 ? void 0 : _d.value;
                        const avitoLink = `https://www.avito.ru/profile/messenger/channel/${chatId}`;
                        const telegramMessage = `Имя клиента: ${userId}\nНомер телефона: ${phoneNumber}\nСсылка на объявление: ${avitoLink}\nКраткое содержание диалога:\n${messageFromOpenAi}`;
                        yield (0, telegramService_1.sendTelegramMessage)(telegramMessage);
                    }
                    else {
                        const processedMessage = yield prisma.processedMessage.findUnique({
                            where: { messageId: messageId }
                        });
                        if (role === 'assistant' && !processedMessage) {
                            console.log('Отправляем сообщение в Авито.');
                            yield sendMessage(userId, chatId, content);
                            yield prisma.processedMessage.create({
                                data: { messageId: messageId }
                            });
                        }
                        else {
                            console.log('Сообщение уже обработано или не является ответом ассистента.');
                        }
                    }
                }
                else {
                    console.log("Run is not completed yet.");
                    setTimeout(() => {
                        checkStatusAndPrintMessages(threadId, runAssistent.id);
                    }, 2000);
                }
            });
            setTimeout(() => {
                checkStatusAndPrintMessages(threadId, runAssistent.id);
            }, 2000);
        }
        catch (error) {
            console.error('Error communicating with OpenAI:', error);
            throw new Error('Error communicating with OpenAI');
        }
    });
}
function waitForAssistantReady(assistantId) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const assistantStatus = yield openai.beta.assistants.retrieve(assistantId);
            // console.log(assistantStatus.instructions);
            if (assistantStatus) {
                console.log("Assistant is ready");
                break;
            }
            console.log("Waiting for assistant to be ready...");
            yield new Promise(resolve => setTimeout(resolve, 1000));
        }
    });
}
function waitForRunCompletion(threadId, runId) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const runStatus = yield openai.beta.threads.runs.retrieve(threadId, runId);
            if (runStatus.status === "completed") {
                console.log("Run completed");
                break;
            }
            console.log("Waiting 1 second...");
            yield new Promise(resolve => setTimeout(resolve, 1000));
        }
    });
}
function getAdvertDataById(adUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(111111111);
        try {
            const { data } = yield axios_1.default.get(adUrl);
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
        }
        catch (error) {
            console.error('Error fetching the ad info:', error);
        }
    });
}
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
});
