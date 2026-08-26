import { Router } from 'express';
import {
  getMe,
  googleCallback,
  loginUser,
  logoutUser,
  requestOTP,
  verifyOTPAndRegister,
  resendOTP,
  forgotPassword,
  resetPassword,
  verifyResetOTP,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateProfile,
  requestEmailChangeOTP,
  verifyEmailChangeOTP,
} from "../controllers/auth.controller.js";
import passport from 'passport';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { otpLimiter, sensitiveActionLimiter} from "../middlewares/rate.middleware.js";



const authRouter = Router();

// OTP-based registration flow
authRouter.post("/request-otp", otpLimiter, requestOTP);  // Step 1: Request OTP
authRouter.post("/verify-otp", otpLimiter, verifyOTPAndRegister);  // Step 2: Verify OTP and register
authRouter.post("/resend-otp", otpLimiter, resendOTP);  // Resend OTP

// Login
authRouter.post('/login',loginUser);

// Logout
authRouter.post('/logout', logoutUser);

authRouter.post("/forgot-password", otpLimiter, forgotPassword);
authRouter.post("/verify-reset-otp", otpLimiter, verifyResetOTP);
authRouter.post("/reset-password", resetPassword);

// Google OAuth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }), googleCallback);

// Get current user
authRouter.get("/me", authenticateUser, getMe);
authRouter.get("/addresses", authenticateUser, getAddresses);
authRouter.post("/addresses", authenticateUser, addAddress);
authRouter.patch("/addresses/:addressId", authenticateUser, updateAddress);
authRouter.delete("/addresses/:addressId", authenticateUser, deleteAddress);
authRouter.patch("/addresses/:addressId/default", authenticateUser, setDefaultAddress);
authRouter.patch("/profile", authenticateUser, sensitiveActionLimiter, updateProfile);
authRouter.post("/request-email-change-otp", otpLimiter, authenticateUser, requestEmailChangeOTP);
authRouter.post("/verify-email-change-otp", otpLimiter, authenticateUser, verifyEmailChangeOTP);


export default authRouter;