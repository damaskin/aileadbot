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
const axios_1 = __importDefault(require("axios"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json());
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUrl = process.env.REDIRECT_URL;
let accessToken = '';
app.get('/oauth2/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const response = yield axios_1.default.post('https://api.avito.ru/token', null, {
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
    }
    catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Failed to get access token');
    }
}));
app.post('/send-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, message } = req.body;
    try {
        const response = yield axios_1.default.post(`https://api.avito.ru/messenger/v1/accounts/me/chats/${chatId}/messages`, { text: message }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.send('Message sent successfully');
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Failed to send message');
    }
}));
app.get('/messages/:chatId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    try {
        const response = yield axios_1.default.get(`https://api.avito.ru/messenger/v1/accounts/me/chats/${chatId}/messages`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Failed to fetch messages');
    }
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
});
