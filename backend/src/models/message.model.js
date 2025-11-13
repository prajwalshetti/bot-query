import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: false // For bot, can store null or use a reserved ObjectId
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: false
    },
    body: {
        type: String,
        required: true
    },
    isFromBot: {
        type: Boolean,
        default: false
    },
    urgencyScore: {
        type: Number,
        min: 1,
        max: 5
    },
    suggestion: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
