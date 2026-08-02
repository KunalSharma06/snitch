import { setUser, setLoading } from "../state/auth.slice.js";
import {
  requestOTP,
  verifyOTPAndRegister,
  resendOTP,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyResetOTP
} from "../services/auth.api.js";
import { useDispatch } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();

  // Step 1: Request OTP
  async function handleRequestOTP({
    email,
    contact,
    password,
    fullName,
    isSeller,
  }) {
    const data = await requestOTP({
      email,
      contact,
      password,
      fullName,
      isSeller,
    });

    return data;
  }

  // Step 2: Verify OTP and Register User
  async function handleVerifyOTP(email, otp) {
    const data = await verifyOTPAndRegister(email, otp);

    dispatch(setUser(data.user));

    return data.user;
  }

  // Resend OTP
  async function handleResendOTP(email, fullName) {
    const data = await resendOTP(email, fullName);
    return data;
  }

  // Login
  async function handleLogin({ email, password }) {
    const data = await login({ email, password });

    dispatch(setUser(data.user));
    return data.user;
  }

  // Get Current User
  async function handleGetMe() {
    try {
      dispatch(setLoading(true));

      const data = await getMe();

      dispatch(setUser(data.user));
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setLoading(false));
    }
  }

  // Logout
  async function handleLogout() {
    try {
      await logout();
      dispatch(setUser(null));
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  async function handleForgotPassword(email) {
    const data = await forgotPassword(email);
    return data;
  }

  async function handleVerifyResetOTP(email, otp) {
    const data = await verifyResetOTP(email, otp);
    return data; 
  }

async function handleResetPassword(resetToken, newPassword) {
  const data = await resetPassword(resetToken, newPassword);
  return data;
}

  return {
    handleRequestOTP,
    handleVerifyOTP,
    handleResendOTP,
    handleLogin,
    handleGetMe,
    handleLogout,
    handleForgotPassword,
    handleVerifyResetOTP,
    handleResetPassword,
  };
};
