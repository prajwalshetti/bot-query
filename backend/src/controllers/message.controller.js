import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import geminiSuggest from "../utils/geminiSuggest.js";

// 1. Save message from user
export const sendUserMessage = async (req, res) => {
    try {
        const { body } = req.body;
        const userId = req.user._id;
        
        if (!body || !body.trim()) {
            return res.status(400).json({ error: "Message body is required" });
        }
        
        const userMessage = await Message.create({
            userId,
            body,
            isFromBot: false,
            isFromAdmin: false,
        });
        
        res.status(201).json({ userMessage });
    } catch (error) {
        console.error("Error in sendUserMessage:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
};

// 2. Bot replies based on user's message
export const replyByBot = async (req, res) => {
    try {
        const { userMessageId } = req.body;
        
        if (!userMessageId) {
            return res.status(400).json({ error: "userMessageId is required" });
        }
        
        const message = await Message.findById(userMessageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        console.log("Calling geminiSuggest with message body:", message.body);
        const aiResult = await geminiSuggest(message.body);
        console.log("Gemini result:", aiResult);
        
        // Bot message linked to the same user
        const botMessage = await Message.create({
            userId: message.userId,
            body: aiResult.suggestion,
            isFromBot: true,
            isFromAdmin: false,
            urgencyScore: aiResult.urgencyScore || 1,
        });
        
        console.log("Bot message created:", botMessage);
        res.status(201).json({ botMessage });
    } catch (error) {
        console.error("Error in replyByBot:", error);
        res.status(500).json({ error: "Failed to generate bot reply" });
    }
};

// 3. Get conversation for logged-in user
export const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get all messages for this user (from user, bot, and admin)
        const messages = await Message.find({ userId }).sort({ createdAt: 1 });
        
        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error in getConversation:", error);
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
};

// 4. Get all messages for admin
export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate('userId', 'username email')
            .sort({ createdAt: 1 });
        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error in getAllMessages:", error);
        res.status(500).json({ error: "Failed to fetch all messages" });
    }
};

// 5. Admin sends a message to a specific user
export const sendAsAdmin = async (req, res) => {
    try {
        const { body, targetUserId } = req.body;
        
        if (!body || !body.trim()) {
            return res.status(400).json({ error: "Message body is required" });
        }
        
        if (!targetUserId) {
            return res.status(400).json({ error: "Target user ID is required" });
        }
        
        const adminMessage = await Message.create({
            userId: targetUserId,
            body,
            isFromAdmin: true,
            isFromBot: false,
        });
        
        res.status(201).json({ adminMessage });
    } catch (error) {
        console.error("Error in sendAsAdmin:", error);
        res.status(500).json({ error: "Failed to send admin message" });
    }
};

// 6. Get all users with their latest message and urgency
export const getAllUserConversations = async (req, res) => {
    try {
        const users = await User.find().select('_id username email');
        
        const userConversations = await Promise.all(
            users.map(async (user) => {
                // Get latest message from this user's conversation
                const latestMessage = await Message.findOne({
                    userId: user._id
                }).sort({ createdAt: -1 });
                
                // Count total messages in this user's conversation
                const messageCount = await Message.countDocuments({
                    userId: user._id
                });
                
                return {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    latestMessage: latestMessage?.body || "No messages yet",
                    urgencyScore: latestMessage?.urgencyScore || 0,
                    lastMessageTime: latestMessage?.createdAt || user.createdAt,
                    messageCount
                };
            })
        );
        
        res.status(200).json({ conversations: userConversations });
    } catch (error) {
        console.error("Error in getAllUserConversations:", error);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
};

// 7. Get specific user's conversation for admin
export const getUserConversationForAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get all messages for this user
        const messages = await Message.find({ userId }).sort({ createdAt: 1 });
        
        // Get user details
        const user = await User.findById(userId).select('username email');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.status(200).json({ 
            user,
            messages 
        });
    } catch (error) {
        console.error("Error in getUserConversationForAdmin:", error);
        res.status(500).json({ error: "Failed to fetch user conversation" });
    }
};
