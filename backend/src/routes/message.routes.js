import express from "express";
import {
    sendUserMessage,
    replyByBot,
    getConversation,
    getAllMessages,
    sendAsAdmin,
    getAllUserConversations,
    getUserConversationForAdmin
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// User routes
router.post("/send", verifyJWT, sendUserMessage);
router.post("/bot-reply", verifyJWT, replyByBot);
router.get("/conversation", verifyJWT, getConversation);

// Admin routes
router.post("/send-as-admin", verifyJWT, sendAsAdmin);
router.get("/all", verifyJWT, getAllMessages);
router.get("/admin/conversations", verifyJWT, getAllUserConversations);
router.get("/admin/user/:userId", verifyJWT, getUserConversationForAdmin);

export default router;
