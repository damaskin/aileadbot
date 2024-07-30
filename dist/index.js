"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const avitoService_1 = require("./services/avitoService");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./swagger");
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const chatController_1 = require("./controllers/chatController");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(body_parser_1.default.json());
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Routes
app.use('/chats', chatRoutes_1.default);
app.use('/messages', messageRoutes_1.default);
app.use('/', webhookRoutes_1.default);
app.use('/get-advert-data', chatController_1.getAdvertData);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    // console.log(`Open the following URL to authorize: https://api.avito.ru/token?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}`);
    (0, avitoService_1.getAccessToken)();
});
