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
exports.sendTelegramMessage = sendTelegramMessage;
exports.containsPhoneNumber = containsPhoneNumber;
exports.containsVinNumber = containsVinNumber;
const telegraf_1 = require("telegraf");
const telegramBotToken = '7233625332:AAHGIDz9PJki3wK4zepgD5kKEG0dWKSsZ-k';
const chatIds = ['210311255', '574581558'];
const bot = new telegraf_1.Telegraf(telegramBotToken);
// Функция для отправки сообщения в Telegram
function sendTelegramMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('message = ', message);
        for (const chatId of chatIds) {
            try {
                yield bot.telegram.sendMessage(chatId, message);
            }
            catch (error) {
                console.error('Error sending message to Telegram:', error);
            }
        }
    });
}
// Функция для проверки наличия телефонного номера в тексте
function containsPhoneNumber(text) {
    const phoneRegex = /(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
}
// Функция для проверки наличия VIN номера в тексте
function containsVinNumber(text) {
    const vinRegex = /\b([A-HJ-NPR-Z0-9]{17})\b/;
    const match = text.match(vinRegex);
    return match ? match[0] : null;
}
