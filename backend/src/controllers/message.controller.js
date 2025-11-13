// controllers/message.controller.js

import { Message } from "../models/message.model.js";
import geminiSuggest from "../utils/geminiSuggest.js";

// 1. Save message from user
export const sendUserMessage = async (req, res) => {
    try {
        const { senderId, receiverId, body } = req.body;
        const userMessage = await Message.create({
            senderId,
            receiverId,
            body,
            isFromBot: false
        });
        res.status(201).json({ userMessage });
    } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
    }
};

// 2. Bot replies based on user's message
export const replyByBot = async (req, res) => {
    try {
        const { userMessageId } = req.body; // Pass id of user's message
        const message = await Message.findById(userMessageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        const aiResult = await geminiSuggest(message.body);
        const botMessage = await Message.create({
            senderId: null, // or bot's id
            receiverId: message.senderId, // send to original user
            body: aiResult.suggestion,
            isFromBot: true,
            urgencyScore: aiResult.urgencyScore
        });
        res.status(201).json({ botMessage });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate bot reply" });
    }
};

// 3. Get conversation for a user
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
};

// 4. Get all messages for admin
export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 });
        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch all messages" });
    }
};
