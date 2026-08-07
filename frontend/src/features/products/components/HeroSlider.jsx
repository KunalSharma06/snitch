// src/features/products/components/HeroSlider.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

const AUTO_ADVANCE_MS = 4500;

const HeroSlider = ({ products }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const slides = (products || [])
    .filter((p) => p.images && p.images.length > 0)
    .slice(0, 5);

  const goTo = useCallback((index) => setCurrent(index), []);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  if (slides.length === 0) return null;

  const activeSlide = slides[current];
  const titleWords = activeSlide.title.split(" ");
  const shortTitle =
    titleWords.slice(0, 6).join(" ") + (titleWords.length > 6 ? "…" : "");

  return (
    <div
      className="relative w-full overflow-hidden border-b"
      style={{ backgroundColor: "#f5f3f0", borderColor: "#e4e2df" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch min-h-[380px] md:min-h-[560px]">
        {/* ── LEFT: Text panel ── */}
        <div className="w-full md:w-[36%] flex flex-col justify-center px-8 lg:px-16 py-12 md:py-0 order-2 md:order-1">
          <div
            key={`text-${current}`}
            style={{ animation: "heroFadeUp 0.6s ease-out" }}
          >
            {activeSlide.brand && activeSlide.brand !== "Unbranded" && (
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-8 h-px"
                  style={{ backgroundColor: "#C9A96E" }}
                />
                <p
                  className="text-[11px] uppercase tracking-[0.3em] font-medium"
                  style={{ color: "#C9A96E" }}
                >
                  {activeSlide.brand}
                </p>
              </div>
            )}
            <h2
              className="text-3xl md:text-4xl lg:text-[2.6rem] font-light leading-[1.2] mb-8"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#1b1c1a",
              }}
            >
              {shortTitle}
            </h2>
            <button
              onClick={() => navigate(`/product/${activeSlide._id}`)}
              className="group relative self-start px-9 py-4 text-[11px] uppercase tracking-[0.25em] font-medium overflow-hidden transition-all duration-300"
              style={{ backgroundColor: "#1b1c1a", color: "#fbf9f6" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#C9A96E";
                e.currentTarget.style.color = "#1b1c1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1b1c1a";
                e.currentTarget.style.color = "#fbf9f6";
              }}
            >
              Discover the Piece
            </button>
          </div>

          {/* Progress dashes */}
          {slides.length > 1 && (
            <div className="flex gap-2 mt-16">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="relative h-[2px] overflow-hidden"
                  style={{ width: "32px", backgroundColor: "#d0c5b5" }}
                >
                  <span
                    className="absolute inset-0 origin-left"
                    style={{
                      backgroundColor: "#C9A96E",
                      transform: idx === current ? "scaleX(1)" : "scaleX(0)",
                      transition:
                        idx === current
                          ? `transform ${AUTO_ADVANCE_MS}ms linear`
                          : "transform 0.2s ease",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Image panel ── */}
        <div
          className="relative w-full md:w-[64%] order-1 md:order-2 overflow-hidden cursor-pointer"
          style={{ minHeight: "320px", backgroundColor: "#ffffff" }}
          onClick={() => navigate(`/product/${activeSlide._id}`)}
        >
          {slides.map((slide, idx) => (
            <img
              key={slide._id}
              src={slide.images[0].url}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
              style={{
                opacity: idx === current ? 1 : 0,
                objectPosition: "center 15%",
              }}
            />
          ))}

          {/* Soft fade into text panel on desktop */}
          <div
            className="hidden md:block absolute inset-y-0 left-0 w-20"
            style={{
              background:
                "linear-gradient(to right, #f5f3f0 0%, transparent 100%)",
            }}
          />

          {/* Prev/Next arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((prev) =>
                    prev === 0 ? slides.length - 1 : prev - 1,
                  );
                }}
                className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10"
                style={{
                  backgroundColor: "rgba(251,249,246,0.85)",
                  border: "1px solid #e4e2df",
                  color: "#1b1c1a",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fbf9f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(251,249,246,0.85)")
                }
                aria-label="Previous slide"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((prev) => (prev + 1) % slides.length);
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10"
                style={{
                  backgroundColor: "rgba(251,249,246,0.85)",
                  border: "1px solid #e4e2df",
                  color: "#1b1c1a",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fbf9f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(251,249,246,0.85)")
                }
                aria-label="Next slide"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes heroFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default HeroSlider;
