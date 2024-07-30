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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvertData = exports.readChatAvito = exports.getChatById = exports.getChats = void 0;
const avitoService_1 = require("../services/avitoService");
const getChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const userId = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.user_id) ? (_b = req.query) === null || _b === void 0 ? void 0 : _b.user_id.toString() : '';
    const chat_id = ((_c = req.query) === null || _c === void 0 ? void 0 : _c.chat_id) ? (_d = req.query) === null || _d === void 0 ? void 0 : _d.chat_id.toString() : '';
    try {
        const chats = yield (0, avitoService_1.getChatMessages)(userId, chat_id);
        res.json(chats);
    }
    catch (error) {
        res.status(500).send('Failed to get chats');
    }
});
exports.getChats = getChats;
const getChatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, chat_id } = req.query;
    console.log('req.query = ', req.query);
    try {
        if (typeof user_id === "string" && (typeof chat_id === "string" || !chat_id)) {
            const chat = yield (0, avitoService_1.getChatMessages)(user_id, chat_id);
            res.json(chat);
        }
    }
    catch (error) {
        res.status(500).send('Failed to get chat');
    }
});
exports.getChatById = getChatById;
const readChatAvito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, chat_id } = req.query;
    try {
        if (typeof user_id === "string" && typeof chat_id === "string") {
            const result = yield (0, avitoService_1.readChat)(user_id, chat_id);
            res.json(result);
        }
    }
    catch (error) {
        res.status(500).send('Failed to mark chat as read');
    }
});
exports.readChatAvito = readChatAvito;
const getAdvertData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('req = ', req);
    console.log(22222222);
    const adUrl = req.query.url;
    try {
        console.log(3333);
        if (!adUrl) {
            return res.status(400).send('URL is required');
        }
        const result = yield (0, avitoService_1.getAdvertDataById)(adUrl);
        res.json(result);
    }
    catch (error) {
        res.status(500).send('Failed to mark chat as read');
    }
});
exports.getAdvertData = getAdvertData;
