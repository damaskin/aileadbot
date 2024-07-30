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
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const body_parser_1 = __importDefault(require("body-parser"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = 3000;
const openai = new openai_1.default({
    apiKey: 'sk-proj-g75mwVqL7cc5YqfZ5YnkT3BlbkFJpS4L7awdp2hkL4EGyrys',
});
const ASSISTANT_ID = 'asst_UsKoR3H3Eo9bViCcy3N9lq8g';
app.use(express_1.default.json());
let chatThreadMap = {};
let processedMessages = new Set();
app.post('/message-to-openai', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, userId, message } = req.body;
    try {
        let threadId = chatThreadMap[chatId];
        if (!threadId) {
            const thread = yield openai.beta.threads.create();
            threadId = thread.id;
            chatThreadMap[chatId] = threadId;
        }
        yield openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message,
        });
        const run = yield openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID,
        });
        const checkStatusAndPrintMessages = (threadId, runId) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            let runStatus = yield openai.beta.threads.runs.retrieve(threadId, runId);
            if (runStatus.status === "completed") {
                let messages = yield openai.beta.threads.messages.list(threadId);
                const lastMessage = messages.data[0];
                const role = lastMessage.role;
                const messageId = lastMessage.id;
                const content = (_b = (_a = lastMessage.content[0]) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.value;
                if (role === 'assistant' && !processedMessages.has(messageId)) {
                    console.log('Отправляем сообщение в Авито.');
                    yield sendMessage(userId, chatId, content);
                    processedMessages.add(messageId);
                }
                else {
                    console.log('Сообщение уже обработано или не является ответом ассистента.');
                }
            }
            else {
                console.log("Run is not completed yet.");
                setTimeout(() => {
                    checkStatusAndPrintMessages(threadId, run.id);
                }, 1000);
            }
        });
        setTimeout(() => {
            checkStatusAndPrintMessages(threadId, run.id);
        }, 1000);
        res.send('Run initiated, check the console for updates.');
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
// Вызов функции для получения токена при запуске сервера
getAccessToken();
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
        // const response = await axios.get('https://api.avito.ru/messenger/v2/accounts/33426042/chats', {
        // const response = await axios.get('https://api.avito.ru/messenger/v3/accounts/33426042/chats/u2i-mSEzMrUaADO~6ooUN8p9gA/messages/', {
        // const response = await axios.get('https://api.avito.ru/messenger/v3/accounts/33426042/chats/u2i-mSEzMrUaADO~6ooUN8p9gA/messages/', {
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
        try {
            const response = yield axios_1.default.get(`https://api.avito.ru/messenger/v2/accounts/${userId}/chats/${chatId}/messages/`);
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
app.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const webhookData = req.body;
    console.log('Received webhook:', webhookData);
    if (((_a = webhookData.payload) === null || _a === void 0 ? void 0 : _a.type) === 'message' && webhookData.payload.value.user_id !== webhookData.payload.value.author_id) {
        const messageId = webhookData.payload.value.id;
        if (processedMessages.has(messageId)) {
            console.log(`Message ${messageId} already processed.`);
            return res.status(200).send('OK');
        }
        const chatId = webhookData.payload.value.chat_id;
        const userId = webhookData.payload.value.user_id;
        try {
            const contentText = webhookData.payload.value.content.text;
            yield axios_1.default.post('https://raynor.a.pinggy.link/message-to-openai', { chatId, userId, message: contentText });
            processedMessages.add(messageId);
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
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
});
