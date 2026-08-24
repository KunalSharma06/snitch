import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useHelp } from "../../help/hook/useHelp";
import { socket } from "../../../lib/socket";
import ConfirmModal from "../../Shared/Components/ConfirmModel";

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
  const {
    handleGetAllConversations,
    handleGetConversationMessages,
    handleSendAgentReply,
    handleCloseConversation,
    handleDeleteConversation,
  } = useHelp();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await handleDeleteConversation(deleteTarget._id);
      if (activeConvo?._id === deleteTarget._id) {
        setActiveConvo(null);
        setMessages([]);
      }
      setDeleteTarget(null);
      fetchConversations();
    } catch (err) {
      console.error("Failed to delete conversation", err);
      alert(err?.response?.data?.message || "Failed to delete conversation");
    } finally {
      setIsDeleting(false);
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
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen pb-24"
        style={{
          backgroundColor: tokens.surface,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-12 lg:pt-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: tokens.secondary }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4 mb-2">
            <h1
              className="font-light"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: tokens.onSurface,
              }}
            >
              Support Inbox
            </h1>
            {!loading && conversations.length > 0 && (
              <span
                className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1"
                style={{
                  backgroundColor: tokens.primary,
                  color: tokens.onSurface,
                }}
              >
                {conversations.filter((c) => c.status === "open").length} Active
              </span>
            )}
          </div>
          <p className="text-sm mb-10" style={{ color: tokens.secondary }}>
            Reply to customer conversations
          </p>

          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            style={{ minHeight: "600px" }}
          >
            {/* Conversation list */}
            <div
              className="lg:col-span-1 overflow-y-auto"
              style={{
                backgroundColor: tokens.surfaceLowest,
                boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
                maxHeight: "600px",
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div
                    className="w-6 h-6 border-2 rounded-full animate-spin mb-4"
                    style={{
                      borderColor: tokens.surfaceHighest,
                      borderTopColor: tokens.primary,
                    }}
                  />
                  <p className="text-xs" style={{ color: tokens.muted }}>
                    Loading conversations...
                  </p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: tokens.surfaceLow }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={tokens.muted}
                      strokeWidth="1.5"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p
                    className="text-base mb-1"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: tokens.onSurface,
                    }}
                  >
                    No conversations yet
                  </p>
                  <p className="text-xs" style={{ color: tokens.muted }}>
                    Customer messages will appear here
                  </p>
                </div>
              ) : (
                conversations.map((convo) => (
                  <div
                    key={convo._id}
                    className="relative border-b transition-colors"
                    style={{
                      borderColor: tokens.surfaceHighest,
                      backgroundColor:
                        activeConvo?._id === convo._id
                          ? tokens.surfaceLow
                          : "transparent",
                    }}
                  >
                    <button
                      onClick={() => openConversation(convo)}
                      className="w-full text-left px-5 py-4 cursor-pointer transition-colors"
                      onMouseEnter={(e) => {
                        if (activeConvo?._id !== convo._id) e.currentTarget.parentElement.style.backgroundColor = tokens.surfaceLow;
                      }}
                      onMouseLeave={(e) => {
                        if (activeConvo?._id !== convo._id) e.currentTarget.parentElement.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: tokens.onSurface }}
                        >
                          {convo.user?.fullName || "Unknown user"}
                        </p>
                        {convo.status === "closed" && (
                          <span
                            className="text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 shrink-0"
                            style={{
                              color: tokens.muted,
                              backgroundColor: tokens.surfaceLow,
                            }}
                          >
                            Closed
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs mb-1"
                        style={{ color: tokens.secondary }}
                      >
                        {convo.user?.email}
                      </p>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: tokens.muted }}
                      >
                        {formatTime(convo.lastMessageAt)}
                      </p>
                    </button>

                    {convo.status === "closed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(convo);
                        }}
                        className="absolute bottom-3 right-4 text-[9px] uppercase tracking-wider underline cursor-pointer"
                        style={{ color: "#c0392b" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat panel */}
            <div
              className="lg:col-span-2 flex flex-col"
              style={{
                backgroundColor: tokens.surfaceLowest,
                boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
                maxHeight: "600px",
              }}
            >
              {!activeConvo ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{ backgroundColor: tokens.surfaceLow }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={tokens.primary}
                      strokeWidth="1.5"
                    >
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9-1.5 0-2.91-.37-4.15-1.02L3 21l1.02-3.85A8.96 8.96 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
                    </svg>
                  </div>
                  <p
                    className="text-lg mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: tokens.onSurface,
                    }}
                  >
                    Select a conversation
                  </p>
                  <p className="text-xs" style={{ color: tokens.muted }}>
                    Choose a customer from the list to view and reply to their
                    messages
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="px-6 py-4 border-b flex items-center justify-between"
                    style={{ borderColor: tokens.surfaceHighest }}
                  >
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: tokens.onSurface }}
                      >
                        {activeConvo.user?.fullName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: tokens.secondary }}
                      >
                        {activeConvo.user?.email}
                      </p>
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
                        style={{
                          color: tokens.muted,
                          backgroundColor: tokens.surfaceLow,
                        }}
                      >
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                    {loadingMessages ? (
                      <p className="text-xs" style={{ color: tokens.muted }}>
                        Loading messages...
                      </p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className="max-w-[70%] px-4 py-2.5 text-sm"
                            style={{
                              backgroundColor:
                                msg.sender === "agent"
                                  ? tokens.onSurface
                                  : tokens.surfaceLow,
                              color:
                                msg.sender === "agent"
                                  ? tokens.surface
                                  : tokens.onSurface,
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div
                    className="px-6 py-4 border-t flex gap-2"
                    style={{ borderColor: tokens.surfaceHighest }}
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder={
                        activeConvo.status === "closed"
                          ? "This conversation is closed"
                          : "Type a reply..."
                      }
                      disabled={sending || activeConvo.status === "closed"}
                      className="flex-1 bg-transparent border py-3 px-4 text-sm focus:outline-none"
                      style={{
                        borderColor: tokens.surfaceHighest,
                        color: tokens.onSurface,
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={
                        sending ||
                        !input.trim() ||
                        activeConvo.status === "closed"
                      }
                      className="px-5 text-[11px] uppercase tracking-wider font-medium cursor-pointer disabled:opacity-50"
                      style={{
                        backgroundColor: tokens.onSurface,
                        color: tokens.surface,
                      }}
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this conversation?"
        message={`This will permanently delete the conversation with "${deleteTarget?.user?.fullName || "this user"}" and all its messages. This cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
};

export default AdminSupport;