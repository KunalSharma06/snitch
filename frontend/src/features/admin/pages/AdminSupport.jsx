import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useHelp } from "../../help/hook/useHelp";
import { socket } from "../../../lib/socket";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceLowest: "#ffffff",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  secondary: "#7A6E63",
  muted: "#B5ADA3",
  primary: "#C9A96E",
};

const AdminSupport = () => {
  const navigate = useNavigate();
  const { handleGetAllConversations, handleGetConversationMessages, handleSendAgentReply, handleCloseConversation } = useHelp();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const data = await handleGetAllConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    socket.emit("joinAdminSupport");
  }, []);

  useEffect(() => {
    const handleNew = (data) => {
      // Refresh conversation list ordering / last message
      fetchConversations();

      // If currently viewing this conversation, append the message live
      if (activeConvo && data.conversationId === activeConvo._id) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on("newSupportMessage", handleNew);
    return () => socket.off("newSupportMessage", handleNew);
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (convo) => {
    setActiveConvo(convo);
    setLoadingMessages(true);
    try {
      const msgs = await handleGetConversationMessages(convo._id);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

    const handleCloseConvo = async (conversationId) => {
      try {
        await handleCloseConversation(conversationId);
        setActiveConvo((prev) => ({ ...prev, status: "closed" }));
        fetchConversations();
      } catch (err) {
        console.error("Failed to close conversation", err);
      }
    };

  const handleSend = async () => {
    if (!input.trim() || sending || !activeConvo) return;
    setSending(true);
    const text = input.trim();
    setInput("");

    try {
      const message = await handleSendAgentReply(activeConvo._id, text);
      setMessages((prev) => [...prev, message]);
      fetchConversations();
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen pb-24" style={{ backgroundColor: tokens.surface, fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-12 lg:pt-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: tokens.secondary }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1
            className="font-light mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: tokens.onSurface }}
          >
            Support Inbox
          </h1>
          <p className="text-sm mb-10" style={{ color: tokens.secondary }}>
            Reply to customer conversations
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: "600px" }}>
            {/* Conversation list */}
            <div className="lg:col-span-1 overflow-y-auto" style={{ backgroundColor: tokens.surfaceLowest, boxShadow: "0 6px 20px rgba(27,28,26,0.04)", maxHeight: "600px" }}>
              {loading ? (
                <p className="text-xs p-6" style={{ color: tokens.muted }}>Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <p className="text-xs p-6" style={{ color: tokens.muted }}>No conversations yet.</p>
              ) : (
                conversations.map((convo) => (
                  <button
                    key={convo._id}
                    onClick={() => openConversation(convo)}
                    className="w-full text-left px-5 py-4 border-b cursor-pointer transition-colors"
                    style={{
                      borderColor: tokens.surfaceHighest,
                      backgroundColor: activeConvo?._id === convo._id ? tokens.surfaceLow : "transparent",
                    }}
                  >
                    <p className="text-sm font-medium mb-1" style={{ color: tokens.onSurface }}>
                      {convo.user?.fullName || "Unknown user"}
                    </p>
                    <p className="text-xs mb-1" style={{ color: tokens.secondary }}>{convo.user?.email}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: tokens.muted }}>
                      {formatTime(convo.lastMessageAt)}
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Chat panel */}
            <div className="lg:col-span-2 flex flex-col" style={{ backgroundColor: tokens.surfaceLowest, boxShadow: "0 6px 20px rgba(27,28,26,0.04)", maxHeight: "600px" }}>
              {!activeConvo ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm" style={{ color: tokens.muted }}>Select a conversation to view messages</p>
                </div>
              ) : (
                <>
                                    <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: tokens.surfaceHighest }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: tokens.onSurface }}>
                        {activeConvo.user?.fullName}
                      </p>
                      <p className="text-xs" style={{ color: tokens.secondary }}>{activeConvo.user?.email}</p>
                    </div>
                    {activeConvo.status === "open" ? (
                      <button
                        onClick={() => handleCloseConvo(activeConvo._id)}
                        className="text-[10px] uppercase tracking-wider underline cursor-pointer"
                        style={{ color: "#c0392b" }}
                      >
                        Close Chat
                      </button>
                    ) : (
                      <span
                        className="text-[9px] uppercase tracking-wider font-bold px-2.5 py-1"
                        style={{ color: tokens.muted, backgroundColor: tokens.surfaceLow }}
                      >
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                    {loadingMessages ? (
                      <p className="text-xs" style={{ color: tokens.muted }}>Loading messages...</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg._id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                          <div
                            className="max-w-[70%] px-4 py-2.5 text-sm"
                            style={{
                              backgroundColor: msg.sender === "agent" ? tokens.onSurface : tokens.surfaceLow,
                              color: msg.sender === "agent" ? tokens.surface : tokens.onSurface,
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                                    <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: tokens.surfaceHighest }}>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder={activeConvo.status === "closed" ? "This conversation is closed" : "Type a reply..."}
                      disabled={sending || activeConvo.status === "closed"}
                      className="flex-1 bg-transparent border py-3 px-4 text-sm focus:outline-none"
                      style={{ borderColor: tokens.surfaceHighest, color: tokens.onSurface }}
                    />
                      <button
                      onClick={handleSend}
                      disabled={sending || !input.trim() || activeConvo.status === "closed"}
                      className="px-5 text-[11px] uppercase tracking-wider font-medium cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: tokens.onSurface, color: tokens.surface }}
                    >
                      Reply
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSupport;