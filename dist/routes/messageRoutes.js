"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.post('/', messageController_1.sendMessageAvito);
router.post('/:message_id', messageController_1.deleteMessageAvito);
exports.default = router;
