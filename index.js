const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3000;

// Middleware для парсинга JSON-тел запросов
app.use(bodyParser.json());

// Настройки OpenAI API
const openaiApiKey = 'sk-proj-g75mwVqL7cc5YqfZ5YnkT3BlbkFJpS4L7awdp2hkL4EGyrys';
const assistantId = 'asst_UsKoR3H3Eo9bViCcy3N9lq8g'; // Замените на ID вашего ассистента
const openaiApiUrl = `https://api.openai.com/v1/assistants/${assistantId}/completions`;
const configuration = new Configuration({
    apiKey: openaiApiKey,
});

const openai = new OpenAIApi(configuration);


// Маршрут для отправки сообщений и получения ответов от OpenAI API
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-4', // Укажите модель, которую вы используете
            messages: [{ role: 'user', content: message }]
        });

        const assistantReply = response.data.choices[0].message.content;
        res.json({ reply: assistantReply });
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: error.response ? error.response.data : 'Error communicating with OpenAI API'
        });
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
