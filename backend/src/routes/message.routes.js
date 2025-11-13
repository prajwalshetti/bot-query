// routes/message.routes.js

import express from "express";
import {
    sendUserMessage,
    replyByBot,
    getConversation,
    getAllMessages
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", sendUserMessage);          // User sends message
router.post("/bot-reply", replyByBot);          // Bot replies to user message
router.get("/user/:userId", getConversation);   // Fetch all for user
router.get("/all", getAllMessages);             // Admin fetches all

export default router;
