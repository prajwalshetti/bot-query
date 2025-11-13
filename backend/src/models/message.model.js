import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  body: {
    type: String,
    required: true
  },
  isFromBot: {
    type: Boolean,
    default: false
  },
  isFromAdmin: {
    type: Boolean,
    default: false
  },
  urgencyScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
