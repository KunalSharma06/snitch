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
  verifyResetOTP
} from '../controllers/auth.controller.js';
import passport from 'passport';
import { authenticateUser } from '../middlewares/auth.middleware.js';


const authRouter = Router();

// OTP-based registration flow
authRouter.post('/request-otp', requestOTP);  // Step 1: Request OTP
authRouter.post('/verify-otp', verifyOTPAndRegister);  // Step 2: Verify OTP and register
authRouter.post('/resend-otp', resendOTP);  // Resend OTP

// Login
authRouter.post('/login', loginUser);

// Logout
authRouter.post('/logout', logoutUser);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOTP);
authRouter.post("/reset-password", resetPassword);

// Google OAuth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }), googleCallback);

// Get current user
authRouter.get("/me", authenticateUser, getMe);

export default authRouter;