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

  const goTo = useCallback((index) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden cursor-pointer"
      style={{ height: "min(78vh, 640px)", backgroundColor: "#1b1c1a" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((product, idx) => (
        <div
          key={product._id}
          onClick={() => navigate(`/product/${product._id}`)}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{
            opacity: idx === current ? 1 : 0,
            pointerEvents: idx === current ? "auto" : "none",
          }}
        >
          {/* Blurred background fill — no more black bars */}
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${product.images[0].url})`,
              backgroundSize: "cover",
              backgroundPosition: "center 15%",
              filter: "blur(28px) brightness(0.55) saturate(1.1)",
              transform: "scale(1.15)",
            }}
          />
          {/* Dark tint over blur for consistency */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(27,28,26,0.35)" }}
          />

          {/* Sharp foreground image, centered, contained */}
          <div className="relative w-full h-full flex items-center justify-center px-4">
            <img
              src={product.images[0].url}
              alt={product.title}
              className="h-full w-auto object-contain drop-shadow-2xl"
              style={{
                maxHeight: "100%",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))",
              }}
            />
          </div>

          {/* Bottom gradient for text legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              background:
                "linear-gradient(to top, rgba(27,28,26,0.75) 0%, transparent 100%)",
            }}
          />

          {/* Brand label only */}
          {product.brand && product.brand !== "Unbranded" && (
            <div className="absolute bottom-10 left-8 lg:left-16 z-10">
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="w-8 h-px"
                  style={{ backgroundColor: "#C9A96E" }}
                />
                <p
                  className="text-[12px] uppercase tracking-[0.32em] font-medium"
                  style={{ color: "#C9A96E" }}
                >
                  {product.brand}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 right-8 lg:right-16 flex gap-2 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                goTo(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className="transition-all duration-300"
              style={{
                width: idx === current ? "26px" : "7px",
                height: "7px",
                borderRadius: "4px",
                backgroundColor:
                  idx === current ? "#C9A96E" : "rgba(251,249,246,0.4)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}

      {/* Prev/Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
            }}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all duration-300 z-10 rounded-full"
            style={{
              backgroundColor: "rgba(251,249,246,0.1)",
              border: "1px solid rgba(251,249,246,0.25)",
              color: "#fbf9f6",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(251,249,246,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(251,249,246,0.1)")
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
            className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all duration-300 z-10 rounded-full"
            style={{
              backgroundColor: "rgba(251,249,246,0.1)",
              border: "1px solid rgba(251,249,246,0.25)",
              color: "#fbf9f6",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(251,249,246,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(251,249,246,0.1)")
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
  );
};

export default HeroSlider;
