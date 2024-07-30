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
exports.deleteMessageAvito = exports.sendMessageAvito = void 0;
const avitoService_1 = require("../services/avitoService");
const sendMessageAvito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, chatId, message } = req.body;
    try {
        const responseData = yield (0, avitoService_1.sendMessage)(userId, chatId, message);
        res.json(responseData);
    }
    catch (error) {
        res.status(500).send('Failed to send message');
    }
});
exports.sendMessageAvito = sendMessageAvito;
const deleteMessageAvito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, chat_id, message_id } = req.params;
    try {
        const result = yield (0, avitoService_1.deleteMessage)(user_id, chat_id, message_id);
        res.json(result);
    }
    catch (error) {
        res.status(500).send('Failed to delete message');
    }
});
exports.deleteMessageAvito = deleteMessageAvito;
