import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import userData from "./userdata.json"; // Import your CSV data

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
  
  // CSV Analysis state (NEW)
  const [csvUsers, setCsvUsers] = useState([]);
  const [selectedCsvUser, setSelectedCsvUser] = useState(null);
  const [csvAnalysis, setCsvAnalysis] = useState({});
  const [analyzingUserId, setAnalyzingUserId] = useState(null);
  const [showCsvPanel, setShowCsvPanel] = useState(false);
  
  const chatRef = useRef(null);

  // Load CSV user IDs on mount
  useEffect(() => {
    const userIds = Object.keys(userData);
    setCsvUsers(userIds);
  }, []);

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
    setShowCsvPanel(false); // Close CSV panel when viewing live chat
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

  // Analyze single CSV user on demand (NEW)
  const handleAnalyzeSingleUser = async (userId) => {
    // If already analyzed, just expand it
    if (csvAnalysis[userId]) {
      setSelectedCsvUser(selectedCsvUser === userId ? null : userId);
      return;
    }

    setAnalyzingUserId(userId);
    setSelectedCsvUser(userId);
    
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/messages/admin/analyze-single-csv-user",
        { 
          userId,
          messages: userData[userId]
        },
        { withCredentials: true }
      );
      
      setCsvAnalysis(prev => ({
        ...prev,
        [userId]: response.data.analysis
      }));
    } catch (error) {
      console.error("Failed to analyze user:", error);
      alert("Failed to analyze user: " + (error.response?.data?.error || error.message));
    } finally {
      setAnalyzingUserId(null);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              setShowCsvPanel(!showCsvPanel);
              setSelectedUser(null);
            }}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {showCsvPanel ? "Live Chat" : "CSV Analysis"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          {/* Left Panel - User List or CSV Users */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 flex flex-col">
            {!showCsvPanel ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Live User Conversations</h2>

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
              </>
            ) : (
              <>
                {/* CSV Users Panel */}
                <h2 className="text-xl font-semibold mb-4">CSV Users Analysis</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Click on any user to analyze their messages ({csvUsers.length} users)
                </p>
                
                <div className="flex-1 overflow-y-auto space-y-2">
                  {csvUsers.map((userId) => (
                    <div key={userId} className="bg-gray-700 rounded-lg overflow-hidden">
                      {/* User Header - Clickable */}
                      <button
                        onClick={() => handleAnalyzeSingleUser(userId)}
                        disabled={analyzingUserId === userId}
                        className="w-full p-3 text-left flex justify-between items-center hover:bg-gray-600 transition disabled:opacity-50"
                      >
                        <div className="flex-1">
                          <span className="font-semibold">User ID: {userId}</span>
                          <p className="text-xs text-gray-400 mt-1">
                            {userData[userId].length} messages
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {analyzingUserId === userId && (
                            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                          )}
                          {csvAnalysis[userId] && (
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              csvAnalysis[userId].urgencyScore >= 4 ? "bg-red-500" :
                              csvAnalysis[userId].urgencyScore >= 3 ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}>
                              {csvAnalysis[userId].urgencyScore}/5
                            </span>
                          )}
                          <svg className={`w-4 h-4 transition-transform ${selectedCsvUser === userId ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {/* Expanded Content */}
                      {selectedCsvUser === userId && csvAnalysis[userId] && (
                        <div className="p-4 bg-gray-800 border-t border-gray-600">
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Recent Messages:</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {userData[userId].slice(0, 3).map((msg, idx) => (
                                <p key={idx} className="text-xs text-gray-300 bg-gray-900 p-2 rounded">
                                  [{msg.timestamp}] {msg.message.substring(0, 80)}...
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="bg-gray-900 p-3 rounded">
                            <p className="text-xs text-gray-400 mb-2 font-semibold">AI Suggested Response:</p>
                            <p className="text-sm text-gray-200 leading-relaxed">{csvAnalysis[userId].suggestedResponse}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Chat or Info */}
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
              <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg">
                  {showCsvPanel 
                    ? "Select a CSV user to analyze their messages" 
                    : "Select a user to view conversation"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adminpage;
