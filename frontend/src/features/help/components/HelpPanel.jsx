import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import { FAQ_ITEMS, SUPPORT_EMAIL } from "../data/faqData";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  secondary: "#7A6E63",
  muted: "#B5ADA3",
  primary: "#C9A96E",
};

const HelpPanel = ({ isOpen, onClose }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [view, setView] = useState("faq"); // "faq" | "chat"

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(27, 28, 26, 0.4)" }}
        onClick={onClose}
      />
      <div
        className="absolute top-0 right-0 h-full w-full max-w-md flex flex-col animate-slide-in-right"
        style={{ backgroundColor: tokens.surface, boxShadow: "-10px 0 40px rgba(27,28,26,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-5 border-b" style={{ borderColor: tokens.surfaceHighest }}>
          <div className="flex items-center gap-3">
            {view === "chat" && (
              <button onClick={() => setView("faq")} className="cursor-pointer" style={{ color: tokens.secondary }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: tokens.muted }}>
                {view === "faq" ? "Help Center" : "Chat with Agent"}
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: tokens.onSurface }}>
                {view === "faq" ? "How can we help?" : "Support Chat"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer" style={{ color: tokens.secondary }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {view === "faq" ? (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4" style={{ color: tokens.primary }}>
              Frequently Asked Questions
            </p>
            <div className="flex flex-col gap-2 mb-8">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} style={{ borderBottom: `1px solid ${tokens.surfaceHighest}` }}>
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
                  >
                    <span className="text-sm pr-4" style={{ color: tokens.onSurface }}>{item.question}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, transform: openFaqIndex === idx ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {openFaqIndex === idx && (
                    <p className="text-xs leading-relaxed pb-4" style={{ color: tokens.secondary }}>
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 mb-6" style={{ backgroundColor: tokens.surfaceLow }}>
              <p className="text-sm font-medium mb-1" style={{ color: tokens.onSurface }}>Still need help?</p>
              <p className="text-xs mb-1" style={{ color: tokens.secondary }}>
                Email us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: tokens.primary, textDecoration: "underline" }}>
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>

            <button
              onClick={() => setView("chat")}
              className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300"
              style={{ backgroundColor: tokens.onSurface, color: tokens.surface }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.primary; e.currentTarget.style.color = tokens.onSurface; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.onSurface; e.currentTarget.style.color = tokens.surface; }}
            >
              Chat with an Agent
            </button>
          </div>
        ) : (
          <ChatWindow />
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default HelpPanel;