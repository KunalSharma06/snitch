import { applyMiddleware } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request OTP for registration
export const requestOTP = async (userData) => {
  try {
    const response = await api.post("/auth/request-otp", {
      fullName: userData.fullName,
      email: userData.email,
      contact: userData.contact,
      password: userData.password,
      isSeller: userData.isSeller,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify OTP and register user
export const verifyOTPAndRegister = async (email, otp) => {
  try {
    const response = await api.post("/auth/verify-otp", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Resend OTP
export const resendOTP = async (email, fullName) => {
  try {
    const response = await api.post("/auth/resend-otp", {
      email,
      fullName,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Login user (existing function)
export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get current user (existing function)
export const getMe = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout user (existing function)
export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const verifyResetOTP = async (email, otp) => {
  const { data } = await api.post("/auth/verify-reset-otp", { email, otp });
  return data;
};


export const resetPassword = async (resetToken, newPassword) => {
  const { data } = await api.post("/auth/reset-password", { resetToken, newPassword });
  return data;
};

export const getAddresses = async () => {
  const { data } = await api.get("/auth/addresses");
  return data;
};

export const addAddress = async (address) => {
  const { data } = await api.post("/auth/addresses", address);
  return data;
};

export const updateAddress = async (addressId, address) => {
  const { data } = await api.patch(`/auth/addresses/${addressId}`, address);
  return data;
};

export const deleteAddress = async (addressId) => {
  const { data } = await api.delete(`/auth/addresses/${addressId}`);
  return data;
};

export const setDefaultAddress = async (addressId) => {
  const { data } = await api.patch(`/auth/addresses/${addressId}/default`);
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.patch("/auth/profile", profileData);
  return data;
};

export const requestEmailChangeOTP = async (newEmail) => {
  const { data } = await api.post("/auth/request-email-change-otp", { newEmail });
  return data;
};

export const verifyEmailChangeOTP = async (newEmail, otp) => {
  const { data } = await api.post("/auth/verify-email-change-otp", { newEmail, otp });
  return data;
};


export default api;
