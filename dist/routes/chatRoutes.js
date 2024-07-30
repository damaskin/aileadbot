"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
router.get('/', chatController_1.getChats);
router.get('/:chat_id', chatController_1.getChatById);
router.post('/:chat_id/read', chatController_1.readChatAvito);
exports.default = router;
