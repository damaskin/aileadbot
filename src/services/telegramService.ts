import { Telegraf } from 'telegraf';

const telegramBotToken = '7233625332:AAHGIDz9PJki3wK4zepgD5kKEG0dWKSsZ-k';
const chatIds = ['210311255', '574581558'];
const bot = new Telegraf(telegramBotToken);

// Функция для отправки сообщения в Telegram
export async function sendTelegramMessage(message: string) {
    console.log('message = ', message);
    for (const chatId of chatIds) {
        try {
            await bot.telegram.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error sending message to Telegram:', error);
        }
    }
}

// Функция для проверки наличия телефонного номера в тексте

export function containsPhoneNumber(text: string): string | null {
    const phoneRegex = /(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
}

// Функция для проверки наличия VIN номера в тексте
export function containsVinNumber(text: string): string | null {
    const vinRegex = /\b([A-HJ-NPR-Z0-9]{17})\b/;
    const match = text.match(vinRegex);
    return match ? match[0] : null;
}
