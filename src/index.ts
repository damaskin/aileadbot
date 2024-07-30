import express from 'express';
import bodyParser from 'body-parser';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import { getAccessToken } from './services/avitoService';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import webhookRoutes from "./routes/webhookRoutes";
import {getAdvertData} from "./controllers/chatController";

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/chats', chatRoutes);
app.use('/messages', messageRoutes);
app.use('/', webhookRoutes);
app.use('/get-advert-data', getAdvertData);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    // console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
    getAccessToken();
});
