import rateLimit from "express-rate-limit";

// General API-wide protection
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP requests — prevents email bombing / spam
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    message: "Too many OTP requests. Please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sensitive account-modifying actions (profile/email change etc.)
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
