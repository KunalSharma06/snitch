import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { otpService } from "../services/otp.service.js";
import { emailService } from "../services/email.service.js";

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "2d",
  });

  res.cookie("token", token)

  return res.status(200).json({
    message,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  })
}

// Step 1: Request OTP for registration
export const requestOTP = async (req, res) => {
  const { email, contact, password, fullName, isSeller } = req.body;

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or contact already exists" });
    }

    // Check if OTP already sent for this email (optional check)
    const otpExists = await otpService.otpExists(email);
    if (otpExists) {
      return res.status(400).json({ 
        message: "OTP already sent to this email. Please verify or request a new one in 10 minutes." 
      });
    }

    // Generate and send OTP
    const otpResult = await otpService.sendOTP(email);
    
    // Send email with OTP
    await emailService.sendOTPEmail(email, otpResult.otp, fullName);

    // Store registration data temporarily in Redis (to be used after OTP verification)
    const registrationKey = `registration:${email}`;
    const registrationData = {
      email,
      contact,
      password,
      fullName,
      isSeller: isSeller === true || isSeller === "true"
    };
    
    // Store with 10 minute expiry (same as OTP)
    const redisClient = otpService.client;
    await redisClient.setEx(registrationKey, 180, JSON.stringify(registrationData));

    return res.status(200).json({
      message: "OTP sent to your email. Please verify within 10 minutes.",
      success: true,
      email: email
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error sending OTP" });
  }
};

// Step 2: Verify OTP and create user
export const verifyOTPAndRegister = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Verify OTP
    const otpVerification = await otpService.verifyOTP(email, otp);

    if (!otpVerification.success) {
      return res.status(400).json({ 
        message: otpVerification.message 
      });
    }

    // Get registration data from Redis
    const registrationKey = `registration:${email}`;
    const redisClient = otpService.client;
    const registrationDataStr = await redisClient.get(registrationKey);

    if (!registrationDataStr) {
      return res.status(400).json({ 
        message: "Registration data not found. Please request OTP again." 
      });
    }

    const registrationData = JSON.parse(registrationDataStr);

    // Create user with email verified
    const user = await userModel.create({
      email: registrationData.email,
      contact: registrationData.contact,
      password: registrationData.password,
      fullName: registrationData.fullName,
      role: registrationData.isSeller ? "seller" : "buyer",
      isEmailVerified: true
    });

    // Delete registration data from Redis
    await redisClient.del(registrationKey);

    emailService.sendWelcomeEmail(user.email, user.fullName);

    // Send login response
    await sendTokenResponse(user, res, "Email verified! Account created successfully");

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error verifying OTP" });
  }
};

// Step 3: Resend OTP
export const resendOTP = async (req, res) => {
  const { email, fullName } = req.body;

  try {
    // Delete existing OTP
    await otpService.deleteOTP(email);

    // Generate new OTP
    const otpResult = await otpService.sendOTP(email);

    // Send email with new OTP
    await emailService.sendOTPEmail(email, otpResult.otp, fullName);

    // 🔽 Refresh registration data expiry to match new OTP expiry
    const registrationKey = `registration:${email}`;
    const redisClient = otpService.client;
    const registrationDataStr = await redisClient.get(registrationKey);

    if (registrationDataStr) {
      await redisClient.setEx(registrationKey, 180, registrationDataStr);
    }

    return res.status(200).json({
      message: "New OTP sent to your email",
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error resending OTP" });
  }
};

// Original login (only for already verified users)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email first. Request OTP to continue.",
        email: email
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    await sendTokenResponse(user, res, "Logged in successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const googleCallback = async (req, res) => {
  const { id, displayName, emails, photos } = req.user;
  const email = emails[0].value;
  const profilePic = photos[0].value;

  let user = await userModel.findOne({ email });

  if (!user) {
    user = await userModel.create({
      email,
      fullName: displayName,
      googleId: id,
      isEmailVerified: true // Google users are pre-verified
    })
  }

  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "2d",
  });

  res.cookie("token", token);
  res.redirect("http://localhost:5173/");
}

export const getMe = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    message: "User fetched successfully",
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  });
}

export const logoutUser = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
};


// Step 1: Request password reset OTP
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ 
        message: "This account uses Google Sign-In. Please log in with Google." 
      });
    }

    const otpExists = await otpService.otpExists(email);
    if (otpExists) {
      return res.status(400).json({ 
        message: "OTP already sent. Please check your email or wait before requesting again." 
      });
    }

    const otpResult = await otpService.sendOTP(email);
    await emailService.sendOTPEmail(email, otpResult.otp, user.fullName);

    return res.status(200).json({
      message: "OTP sent to your email",
      success: true,
      email
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error sending OTP" });
  }
};

export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpVerification = await otpService.verifyOTP(email, otp);

    if (!otpVerification.success) {
      return res.status(400).json({ message: otpVerification.message });
    }

    // Issue a short-lived reset token (5 min) proving OTP was verified
    const resetToken = jwt.sign(
      { email, purpose: "password-reset" },
      config.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      resetToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error verifying OTP" });
  }
};

// Step 3: Reset password using the reset token (no OTP needed here anymore)
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    let payload;
    try {
      payload = jwt.verify(resetToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Reset session expired. Please start again." });
    }

    if (payload.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset session" });
    }

    const user = await userModel.findOne({ email: payload.email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.password = newPassword; // pre('save') hook will hash it
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. Please log in.",
      success: true
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error resetting password" });
  }
};