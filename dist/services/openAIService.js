"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = exports.processedMessages = exports.chatThreadMap = exports.ASSISTANT_ID = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: 'sk-proj-g75mwVqL7cc5YqfZ5YnkT3BlbkFJpS4L7awdp2hkL4EGyrys',
});
exports.openai = openai;
exports.ASSISTANT_ID = 'asst_UsKoR3H3Eo9bViCcy3N9lq8g';
exports.chatThreadMap = {};
exports.processedMessages = new Set();
