import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/user/me", {
          withCredentials: true
        });
        console.log("Current user:", response.data.user);
        setUserId(response.data.user._id);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        alert("Please login first");
      }
    };
    fetchUser();
  }, []);

  // Fetch conversation history
  useEffect(() => {
    if (!userId) return;
    
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/messages/conversation",
          { withCredentials: true }
        );
        console.log("Fetched messages:", response.data.messages);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSend = async () => {
    console.log("=== SEND CLICKED ===");
    console.log("Input:", input);
    
    if (!input.trim()) {
      console.log("Input is empty - returning");
      return;
    }
    
    console.log("Sending message...");
    setLoading(true);
    
    try {
      // Send user message
      console.log("POST to /api/v1/messages/send");
      const userMsgResponse = await axios.post(
        "http://localhost:8000/api/v1/messages/send",
        { body: input },
        { withCredentials: true }
      );
      console.log("User message sent:", userMsgResponse.data);
      
      const newUserMessage = userMsgResponse.data.userMessage;
      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");

      // Trigger bot reply
      console.log("POST to /api/v1/messages/bot-reply");
      const botReplyResponse = await axios.post(
        "http://localhost:8000/api/v1/messages/bot-reply",
        { userMessageId: newUserMessage._id },
        { withCredentials: true }
      );
      console.log("Bot reply received:", botReplyResponse.data);
      
      const botMessage = botReplyResponse.data.botMessage;
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in handleSend:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to send message: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="bg-blue-600 px-4 py-3 rounded-t-lg">
          <h2 className="text-xl font-semibold">Chat Support</h2>
          <p className="text-xs text-blue-100">
            User ID: {userId || "Loading..."}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={chatRef}>
          {messages.length === 0 && (
            <p className="text-gray-400 text-center">
              No messages yet. Start a conversation!
            </p>
          )}
{messages.map((msg, idx) => {
  // Message is from user if it's not from bot or admin
  const isFromUser = !msg.isFromBot && !msg.isFromAdmin;
  
  return (
    <div
      key={idx}
      className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isFromUser
            ? "bg-blue-500 text-white"
            : "bg-gray-700 text-gray-100"
        }`}
      >
        {msg.isFromBot && (
          <span className="text-xs text-blue-300 block mb-1">
            🤖 Bot
          </span>
        )}
        {msg.isFromAdmin && (
          <span className="text-xs text-green-300 block mb-1">
            👤 Admin
          </span>
        )}
        <p>{msg.body}</p>
        {msg.urgencyScore && (
          <span className="text-xs text-red-300 mt-1 block">
            Urgency: {msg.urgencyScore}/5
          </span>
        )}
      </div>
    </div>
  );
})}

        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 rounded-b-lg flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
