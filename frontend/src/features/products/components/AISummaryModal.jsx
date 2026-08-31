import React, { useEffect, useState } from "react";
import axios from "axios";

const SPARKLE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3L13.5 9.5L20 11L13.5 12.5L12 19L10.5 12.5L4 11L10.5 9.5L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AISummaryModal = ({ productId, productTitle, variantId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [followUps, setFollowUps] = useState([]); // { question, answer, loading }
  const [error, setError] = useState(null);

  // Reset when product OR variant changes
  useEffect(() => {
    setSummary(null);
    setSuggestedQuestions([]);
    setFollowUps([]);
    setError(null);
    setLoading(false);
    setIsOpen(false);
  }, [productId, variantId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
       `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000")}/api/products/${productId}/ai-summary`,
        { variantId }
      );

      if (data.success) {
        setSummary(data.summary);
        setSuggestedQuestions(data.suggestedQuestions || []);
      } else {
        setError(data.message || "Could not generate summary.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const askFollowUp = async (question) => {
    setFollowUps((prev) => [...prev, { question, answer: null, loading: true }]);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000")}/api/products/${productId}/ai-summary`,
        { variantId, question }
      );
      setFollowUps((prev) =>
        prev.map((f) => (f.question === question ? { ...f, answer: data.answer, loading: false } : f))
      );
    } catch (err) {
      setFollowUps((prev) =>
        prev.map((f) =>
          f.question === question ? { ...f, answer: "Could not get an answer. Try again.", loading: false } : f
        )
      );
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    if (summary) return;
    await fetchSummary();
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-300 border"
        style={{
          backgroundColor: "transparent",
          borderColor: "#C9A96E",
          color: "#C9A96E",
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#C9A96E";
          e.currentTarget.style.color = "#1b1c1a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#C9A96E";
        }}
        title="Get AI-powered buy recommendation"
      >
        {SPARKLE_ICON}
        AI Review
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
          style={{ backgroundColor: "rgba(27,28,26,0.60)", backdropFilter: "blur(4px)" }}
          onClick={handleClose}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] flex flex-col relative"
            style={{
              backgroundColor: "#fbf9f6",
              fontFamily: "'Inter', sans-serif",
              zIndex: 10000,
              isolation: "isolate",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #e4e2df" }}>
              <div className="flex items-center gap-3 min-w-0">
                <span style={{ color: "#C9A96E", flexShrink: 0 }}>{SPARKLE_ICON}</span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: "#C9A96E" }}>
                    AI Style Advisor
                  </p>
                  <p className="text-sm font-light leading-snug mt-0.5 truncate max-w-[260px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}>
                    {productTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center hover:opacity-60 transition-opacity flex-shrink-0"
                style={{ color: "#7A6E63", cursor: "pointer", background: "none", border: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 py-5 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#C9A96E #e4e2df" }}>
              {loading ? (
                <div className="flex flex-col items-center gap-5 w-full py-8">
                  <div className="relative w-full h-1 overflow-hidden" style={{ backgroundColor: "#e4e2df" }}>
                    <div className="absolute inset-y-0 left-0 w-1/3 rounded-full" style={{ backgroundColor: "#C9A96E", animation: "ai-loading-bar 1.4s ease-in-out infinite" }} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.25em] animate-pulse" style={{ color: "#B5ADA3" }}>
                    Analysing product...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-xs mb-4" style={{ color: "#c0392b" }}>{error}</p>
                  <button onClick={fetchSummary} className="text-[10px] uppercase tracking-[0.2em] underline cursor-pointer" style={{ color: "#7A6E63", background: "none", border: "none" }}>
                    Try Again
                  </button>
                </div>
              ) : summary ? (
                <div className="w-full">
                  <span className="block text-4xl font-light leading-none mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e4e2df" }}>
                    "
                  </span>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#1b1c1a", lineHeight: "1.75", whiteSpace: "pre-line" }}>
                    {summary}
                  </p>

                  {/* Follow-up answers */}
                  {followUps.length > 0 && (
                    <div className="flex flex-col gap-4 mt-6">
                      {followUps.map((f, idx) => (
                        <div key={idx} className="pl-4" style={{ borderLeft: "2px solid #C9A96E" }}>
                          <p className="text-[11px] font-medium mb-1" style={{ color: "#1b1c1a" }}>{f.question}</p>
                          {f.loading ? (
                            <p className="text-[11px]" style={{ color: "#B5ADA3" }}>Thinking...</p>
                          ) : (
                            <p className="text-[12px] leading-relaxed" style={{ color: "#7A6E63" }}>{f.answer}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick question chips */}
                  {suggestedQuestions.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: "#B5ADA3" }}>
                        Ask more
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions
                          .filter((q) => !followUps.some((f) => f.question === q))
                          .map((q) => (
                            <button
                              key={q}
                              onClick={() => askFollowUp(q)}
                              className="px-3 py-1.5 text-[10px] transition-all duration-200 border cursor-pointer"
                              style={{ borderColor: "#d0c5b5", color: "#1b1c1a", background: "transparent" }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C9A96E")}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d0c5b5")}
                            >
                              {q}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => {
                        setFollowUps([]);
                        fetchSummary();
                      }}
                      disabled={loading}
                      className="text-[10px] uppercase tracking-[0.2em] underline cursor-pointer hover:opacity-60 transition-opacity"
                      style={{ color: "#7A6E63", background: "none", border: "none" }}
                    >
                      Regenerate
                    </button>
                      </div>
                      
                  <div className="flex items-center gap-2 mt-5">
                    <div className="h-px flex-1" style={{ backgroundColor: "#e4e2df" }} />
                    <span className="text-[9px] uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: "#B5ADA3" }}>
                      Powered by Mistral AI
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#e4e2df" }} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <style>{`
            @keyframes ai-loading-bar { 0% { left: -33%; } 100% { left: 100%; } }
            div::-webkit-scrollbar { width: 5px; }
            div::-webkit-scrollbar-track { background: #e4e2df; }
            div::-webkit-scrollbar-thumb { background: #C9A96E; }
            div::-webkit-scrollbar-thumb:hover { background: #a98b55; }
          `}</style>
        </div>
      )}
    </>
  );
};

export default AISummaryModal;