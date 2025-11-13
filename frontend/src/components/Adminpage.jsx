import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Adminpage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  
  // User list state
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByUrgency, setSortByUrgency] = useState(false);
  
  // Selected user chat state
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyInput, setReplyInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatRef = useRef(null);

  // Handle secret code submission
  const handleSecretCodeSubmit = (e) => {
    e.preventDefault();
    if (secretCode === "WXY") {
      setAuthenticated(true);
      setError("");
      fetchAllConversations();
    } else {
      setError("Invalid secret code");
    }
  };

  // Fetch all user conversations
  const fetchAllConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/messages/admin/conversations",
        { withCredentials: true }
      );
      setConversations(response.data.conversations);
      setFilteredConversations(response.data.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  // Fetch specific user's conversation
  const fetchUserConversation = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/messages/admin/user/${userId}`,
        { withCredentials: true }
      );
      setSelectedUser(response.data.user);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Failed to fetch user conversation:", error);
    }
  };

  // Handle user selection
  const handleUserSelect = (userId) => {
    fetchUserConversation(userId);
  };

  // Send admin reply
  const handleSendReply = async () => {
    if (!replyInput.trim() || !selectedUser) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/messages/send-as-admin",
        { 
          body: replyInput,
          targetUserId: selectedUser._id
        },
        { withCredentials: true }
      );

      setMessages((prev) => [...prev, response.data.adminMessage]);
      setReplyInput("");
      
      // Refresh conversations list
      fetchAllConversations();
    } catch (error) {
      console.error("Failed to send admin reply:", error);
      alert("Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (searchQuery) {
      const filtered = conversations.filter(
        (conv) =>
          conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  // Sort by urgency
  const handleSortToggle = () => {
    setSortByUrgency(!sortByUrgency);
    const sorted = [...filteredConversations].sort((a, b) => {
      if (!sortByUrgency) {
        return b.urgencyScore - a.urgencyScore;
      }
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
    setFilteredConversations(sorted);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Secret code screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <p className="text-gray-400 text-sm mt-2">Enter secret code to continue</p>
          </div>

          <form onSubmit={handleSecretCodeSubmit}>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter secret code"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          {/* User List Panel */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">User Conversations</h2>

            {/* Search and Sort */}
            <div className="mb-4 space-y-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSortToggle}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                {sortByUrgency ? "Sort by Time" : "Sort by Urgency"}
              </button>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredConversations.length === 0 && (
                <p className="text-gray-400 text-center mt-4">No conversations found</p>
              )}
              {filteredConversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => handleUserSelect(conv.userId)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedUser?._id === conv.userId
                      ? "bg-blue-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{conv.username}</span>
                    {conv.urgencyScore > 0 && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          conv.urgencyScore >= 4
                            ? "bg-red-500"
                            : conv.urgencyScore >= 3
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      >
                        Urgency: {conv.urgencyScore}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 truncate">{conv.latestMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conv.messageCount} messages
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-blue-600 px-4 py-3 rounded-t-lg">
                  <h2 className="text-xl font-semibold">{selectedUser.username}</h2>
                  <p className="text-xs text-blue-100">{selectedUser.email}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={chatRef}>
                  {messages.length === 0 && (
                    <p className="text-gray-400 text-center">No messages yet</p>
                  )}
                  {messages.map((msg, idx) => {
                    const isFromUser = !msg.isFromBot && !msg.isFromAdmin;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isFromUser ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isFromUser
                              ? "bg-gray-700 text-gray-100"
                              : msg.isFromAdmin
                              ? "bg-green-600 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {msg.isFromBot && (
                            <span className="text-xs block mb-1">🤖 Bot</span>
                          )}
                          {msg.isFromAdmin && (
                            <span className="text-xs block mb-1">👤 Admin</span>
                          )}
                          <p>{msg.body}</p>
                          {msg.urgencyScore && (
                            <span className="text-xs mt-1 block opacity-75">
                              Urgency: {msg.urgencyScore}/5
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input */}
                <div className="p-4 bg-gray-900 rounded-b-lg flex gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSendReply()}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={loading || !replyInput.trim()}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Select a user to view conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adminpage;
