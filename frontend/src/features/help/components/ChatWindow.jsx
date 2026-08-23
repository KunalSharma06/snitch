import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useHelp } from "../hook/useHelp";
import { socket } from "../../../lib/socket";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  secondary: "#7A6E63",
  muted: "#B5ADA3",
  primary: "#C9A96E",
};

const WAIT_MS = 5 * 60 * 1000; // 5 minutes

const ChatWindow = () => {
  const user = useSelector((state) => state.auth.user);
  const { handleGetConversation, handleSendMessage } = useHelp();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const [showBusyMessage, setShowBusyMessage] = useState(false);
  const waitTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function fetchConversation() {
      try {
        const data = await handleGetConversation();
        setConversation(data.conversation);
        setMessages(data.messages);

        const hasUserMsg = data.messages.some((m) => m.sender === "user");
        const hasAgentMsg = data.messages.some((m) => m.sender === "agent");
        if (hasUserMsg && !hasAgentMsg) {
          startWaitTimer(new Date(data.messages[data.messages.length - 1].createdAt).getTime());
        }
      } catch (err) {
        console.error("Failed to load conversation", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConversation();
  }, []);

    useEffect(() => {
      const handleIncoming = (data) => {
        setMessages((prev) => [...prev, data.message]);
        if (data.message.sender === "agent") {
          setWaitingForAgent(false);
          setShowBusyMessage(false);
          if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
        }
      };

      const handleClosed = () => {
        setConversation((prev) =>
          prev ? { ...prev, status: "closed" } : prev,
        );
      };

      socket.on("newSupportMessage", handleIncoming);
      socket.on("conversationClosed", handleClosed);
      return () => {
        socket.off("newSupportMessage", handleIncoming);
        socket.off("conversationClosed", handleClosed);
      };
    }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startWaitTimer = (fromTime) => {
    setWaitingForAgent(true);
    setShowBusyMessage(false);
    const elapsed = Date.now() - fromTime;
    const remaining = WAIT_MS - elapsed;

    if (remaining <= 0) {
      setShowBusyMessage(true);
      setWaitingForAgent(false);
      return;
    }

    if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
    waitTimerRef.current = setTimeout(() => {
      setShowBusyMessage(true);
      setWaitingForAgent(false);
    }, remaining);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");

    try {
      const message = await handleSendMessage(text);
      setMessages((prev) => [...prev, message]);
      startWaitTimer(Date.now());
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: tokens.muted }}>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p
              className="text-sm mb-1"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: tokens.onSurface,
                fontSize: "20px",
              }}
            >
              Say hello 👋
            </p>
            <p className="text-xs" style={{ color: tokens.secondary }}>
              Send a message and an agent will get back to you shortly.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[75%] px-4 py-2.5 text-sm"
              style={{
                backgroundColor:
                  msg.sender === "user" ? tokens.onSurface : tokens.surfaceLow,
                color:
                  msg.sender === "user" ? tokens.surface : tokens.onSurface,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {waitingForAgent && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5 text-xs"
              style={{
                backgroundColor: tokens.surfaceLow,
                color: tokens.muted,
              }}
            >
              Waiting for an agent to respond...
            </div>
          </div>
        )}

        {showBusyMessage && (
          <div
            className="px-4 py-3 text-xs text-center"
            style={{ backgroundColor: "#fff3cd", color: "#856404" }}
          >
            All our agents are currently busy. Please try again later, or email
            us for assistance.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {conversation?.status === "closed" && (
        <div
          className="px-6 py-3 text-xs text-center"
          style={{
            backgroundColor: tokens.surfaceLow,
            color: tokens.secondary,
          }}
        >
          This conversation has been closed. Start a new chat if you need
          further help.
        </div>
      )}
      <div
        className="px-6 py-5 border-t flex gap-2"
        style={{ borderColor: tokens.surfaceHighest }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            conversation?.status === "closed"
              ? "Conversation closed"
              : "Type a message..."
          }
          disabled={sending || conversation?.status === "closed"}
          className="flex-1 bg-transparent border py-3 px-4 text-sm focus:outline-none"
          style={{
            borderColor: tokens.surfaceHighest,
            color: tokens.onSurface,
          }}
        />
        <button
          onClick={handleSend}
          disabled={
            sending || !input.trim() || conversation?.status === "closed"
          }
          className="px-5 text-[11px] uppercase tracking-wider font-medium cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: tokens.onSurface, color: tokens.surface }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;