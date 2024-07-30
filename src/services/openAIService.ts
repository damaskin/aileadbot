import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: 'sk-proj-g75mwVqL7cc5YqfZ5YnkT3BlbkFJpS4L7awdp2hkL4EGyrys',
});

export const ASSISTANT_ID = 'asst_UsKoR3H3Eo9bViCcy3N9lq8g';
export let chatThreadMap: { [chatId: string]: string } = {};
export let processedMessages = new Set<string>();

export { openai };
