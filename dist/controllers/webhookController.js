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
exports.processWebhook = exports.registerWebhook = void 0;
const avitoService_1 = require("../services/avitoService");
const registerWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    try {
        const response = yield (0, avitoService_1.registerWebhook)(url);
        res.json(response);
    }
    catch (error) {
        res.status(500).send('Failed to register webhook');
    }
});
exports.registerWebhook = registerWebhook;
const processWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const webhookData = req.body;
    console.log('Received webhook:', webhookData);
    try {
        yield (0, avitoService_1.processWebhook)(webhookData);
        res.status(200).send('OK');
    }
    catch (error) {
        res.status(500).send('Failed to process webhook data');
    }
});
exports.processWebhook = processWebhook;
