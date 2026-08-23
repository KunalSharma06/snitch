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

  res.cookie("token", token);

  return res.status(200).json({
    message,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
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
        message:
          "OTP already sent to this email. Please verify or request a new one in 10 minutes.",
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
      isSeller: isSeller === true || isSeller === "true",
    };

    // Store with 10 minute expiry (same as OTP)
    const redisClient = otpService.client;
    await redisClient.setEx(
      registrationKey,
      180,
      JSON.stringify(registrationData),
    );

    return res.status(200).json({
      message: "OTP sent to your email. Please verify within 10 minutes.",
      success: true,
      email: email,
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
        message: otpVerification.message,
      });
    }

    // Get registration data from Redis
    const registrationKey = `registration:${email}`;
    const redisClient = otpService.client;
    const registrationDataStr = await redisClient.get(registrationKey);

    if (!registrationDataStr) {
      return res.status(400).json({
        message: "Registration data not found. Please request OTP again.",
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
      isEmailVerified: true,
    });

    // Delete registration data from Redis
    await redisClient.del(registrationKey);

    emailService.sendWelcomeEmail(user.email, user.fullName);

    // Send login response
    await sendTokenResponse(
      user,
      res,
      "Email verified! Account created successfully",
    );
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
const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const redisClient = otpService.client;
    const failKey = `login-fails:${email.toLowerCase()}`;

    const failCount = await redisClient.get(failKey);
    const currentFails = failCount ? Number(failCount) : 0;

    const user = await userModel.findOne({ email });

    if (!user) {
      if (currentFails >= 5) {
        const ttl = await redisClient.ttl(failKey);
        const minutes = Math.ceil(ttl / 60);
        return res.status(429).json({
          message: `Too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
        });
      }
      await redisClient
        .multi()
        .incr(failKey)
        .expire(failKey, 15 * 60)
        .exec();
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email first. Request OTP to continue.",
        email: email,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      if (currentFails >= 5) {
        const ttl = await redisClient.ttl(failKey);
        const minutes = Math.ceil(ttl / 60);
        return res.status(429).json({
          message: `Too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
        });
      }
      await redisClient
        .multi()
        .incr(failKey)
        .expire(failKey, 15 * 60)
        .exec();
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Correct password — always succeeds, regardless of prior fail count
    await redisClient.del(failKey);

    const adminEmails = getAdminEmails();
    if (
      adminEmails.includes(user.email.toLowerCase()) &&
      user.role !== "admin"
    ) {
      user.role = "admin";
      await user.save();
    }

    await sendTokenResponse(user, res, "Logged in successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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
      isEmailVerified: true, // Google users are pre-verified
    });
  }

  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "2d",
  });

  res.cookie("token", token);
  res.redirect("http://localhost:5173/");
};

export const getMe = async (req, res) => {
  let user = req.user;

  const adminEmails = getAdminEmails();
  if (adminEmails.includes(user.email.toLowerCase()) && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }

  res.status(200).json({
    message: "User fetched successfully",
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

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
      return res
        .status(400)
        .json({ message: "No account found with this email" });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please log in with Google.",
      });
    }

    const otpExists = await otpService.otpExists(email);
    if (otpExists) {
      return res.status(400).json({
        message:
          "OTP already sent. Please check your email or wait before requesting again.",
      });
    }

    const otpResult = await otpService.sendOTP(email);
    await emailService.sendOTPEmail(email, otpResult.otp, user.fullName);

    return res.status(200).json({
      message: "OTP sent to your email",
      success: true,
      email,
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
      { expiresIn: "5m" },
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
      return res
        .status(400)
        .json({ message: "Reset session expired. Please start again." });
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
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error resetting password" });
  }
};

// Get all saved addresses for logged-in user
export const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    return res.status(200).json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching addresses" });
  }
};

// Add a new address
export const addAddress = async (req, res) => {
  const { fullName, phone, line1, line2, city, state, pincode } = req.body;

  try {
    const user = await userModel.findById(req.user._id);

    // If this is the first address, make it default
    const isFirst = user.addresses.length === 0;

    user.addresses.push({
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      isDefault: isFirst,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error adding address" });
  }
};

// Update an existing address
export const updateAddress = async (req, res) => {
  const { addressId } = req.params;
  const { fullName, phone, line1, line2, city, state, pincode } = req.body;

  try {
    const user = await userModel.findById(req.user._id);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (line1) address.line1 = line1;
    if (line2 !== undefined) address.line2 = line2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating address" });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const user = await userModel.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== addressId,
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address removed successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting address" });
  }
};

// Set an address as default
export const setDefaultAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const user = await userModel.findById(req.user._id);
    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === addressId;
    });
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated",
      addresses: user.addresses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error setting default address" });
  }
};

export const updateProfile = async (req, res) => {
  const { fullName, email, contact } = req.body;

  try {
    const user = req.user;

    if (email && email !== user.email) {
      const existing = await userModel.findOne({ email });
      if (existing) {
        return res.status(400).json({
          message: "Email is already in use",
          success: false,
        });
      }
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (contact) user.contact = contact;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating profile" });
  }
};

export const requestEmailChangeOTP = async (req, res) => {
  const { newEmail } = req.body;

  if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid email address" });
  }

  try {
    const existing = await userModel.findOne({ email: newEmail });
    if (existing) {
      return res.status(400).json({ message: "This email is already in use" });
    }


    const { otp } = await otpService.sendOTP(newEmail);
    console.log("OTP for email change:", otp, "-> sending to:", newEmail);

    await emailService.sendOTPEmail(newEmail, otp, req.user.fullName);
        console.log("sendOTPEmail call completed");

    return res.status(200).json({
      success: true,
      message: "OTP sent to your new email address",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error sending OTP" });
  }
};

export const verifyEmailChangeOTP = async (req, res) => {
  const { newEmail, otp } = req.body;

  if (!newEmail || !otp) {
    return res.status(400).json({ message: "Missing email or OTP" });
  }

  try {
    const result = await otpService.verifyOTP(newEmail, otp);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    const existing = await userModel.findOne({ email: newEmail });
    if (existing) {
      return res.status(400).json({ message: "This email is already in use" });
    }

    const user = req.user;
    user.email = newEmail;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error verifying OTP" });
  }
};