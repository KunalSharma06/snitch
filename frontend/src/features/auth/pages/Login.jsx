import React, { useState, useRef } from "react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router";
import ContinueWithGoogle from "../components/ContinueWithGoogle";

const Login = () => {
  const { handleLogin, handleForgotPassword, handleVerifyResetOTP, handleResetPassword } = useAuth();
  const navigate = useNavigate();

  // "login" | "forgot-email" | "forgot-otp" | "forgot-newpass"
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toastError, setToastError] = useState("");
  const [loginBlockedUntil, setLoginBlockedUntil] = useState(null);

  const showToast = (message) => {
    setToastError(message);
    setTimeout(() => {
      setToastError("");
    }, 4000);
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const otpInputsRef = useRef([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
   e.preventDefault();

   if (loginBlockedUntil && Date.now() < loginBlockedUntil) {
     return;
   }

   try {
     const user = await handleLogin({
       email: formData.email,
       password: formData.password,
     });
     if (user.role == "buyer") {
       navigate("/");
     } else if (user.role == "seller") {
       navigate("/seller/dashboard");
     }
   } catch (error) {
     console.error("Login failed", error);
     const message = error?.message || "Invalid email or password";
     showToast(message);

     // Extract minutes from the message and set a temporary block
     const match = message.match(/(\d+)\s*minute/);
     if (match) {
       const minutes = Number(match[1]);
       setLoginBlockedUntil(Date.now() + minutes * 60 * 1000);
     }
   }
 };

  // Forgot password: step 1 - request OTP
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await handleForgotPassword(forgotEmail);
      setSuccessMessage("OTP sent to your email!");
      setStep("forgot-otp");
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP box handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    const otpString = newOtp.join("").slice(0, 6);
    setOtp(otpString);
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Forgot password: step 2 - verify OTP only
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await handleVerifyResetOTP(forgotEmail, otp);
       console.log("OTP verify response:", data);
      setResetToken(data.resetToken);
      setSuccessMessage("OTP verified! Set your new password.");
      setStep("forgot-newpass");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password: step 3 - set new password using resetToken
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await handleResetPassword(resetToken, newPassword);
      setSuccessMessage("Password reset successfully! Please log in.");
      setTimeout(() => {
        handleBackToLogin();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Reset session expired. Please start again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    setError("");
    setSuccessMessage("");
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotEmail("");
  };

  const handleResendResetOtp = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      await handleForgotPassword(forgotEmail);
      setSuccessMessage("New OTP sent to your email");
      setOtp("");
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen flex flex-col lg:flex-row selection:bg-[#C9A96E]/30"
        style={{
          backgroundColor: "#fbf9f6",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Toast Notification */}
        {toastError && (
          <div className="fixed top-12 right-12 z-[9999] px-8 py-5 flex items-center gap-4 animate-slide-in-right"
               style={{
                 backgroundColor: "#fbf9f6",
                 border: "1px solid #e4e2df",
                 boxShadow: "0 20px 40px rgba(27,28,26,0.08)",
               }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "#ba1a1a" }}>
              {toastError}
            </span>
          </div>
        )}

        {/* ── LEFT: Editorial Image Panel ── */}
        <div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          style={{ backgroundColor: "#f5f3f0" }}
        >
          <img
            src="/snitch_editorial_warm.png"
            alt="Snitch Fashion Editorial"
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ filter: "brightness(0.97)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(27,24,20,0.62) 0%, rgba(27,24,20,0.08) 45%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 p-14 flex flex-col justify-between z-10">
            <span
              className="text-sm font-medium tracking-[0.35em] uppercase"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#C9A96E",
                letterSpacing: "0.35em",
              }}
            >
              Snitch.
            </span>
            <div>
              <p
                className="text-5xl xl:text-6xl font-light leading-[1.08] text-white mb-5"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Welcome
                <br />
                <em>back.</em>
              </p>
              <p
                className="text-sm font-light leading-relaxed max-w-xs"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Sign in to explore the latest exclusive drops and manage your
                aesthetic.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center min-h-screen px-8 sm:px-14 lg:px-20 py-16"
          style={{ backgroundColor: "#fbf9f6" }}
        >
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-14">
              <span
                className="text-sm tracking-[0.35em] uppercase"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#C9A96E",
                }}
              >
                Snitch.
              </span>
            </div>

            {/* ============ STEP: LOGIN ============ */}
            {step === "login" && (
              <>
                <div className="mb-14">
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] mb-4 font-medium"
                    style={{ color: "#C9A96E" }}
                  >
                    Sign in to Snitch
                  </p>
                  <h1
                    className="text-[2.6rem] xl:text-5xl font-light leading-[1.1]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#1b1c1a",
                    }}
                  >
                    Enter the Vault
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="login-email"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Email Address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="hello@example.com"
                      className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                      style={{
                        color: "#1b1c1a",
                        borderBottom: "1px solid #d0c5b5",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#C9A96E")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#d0c5b5")}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="text-[10px] uppercase tracking-[0.18em] font-medium"
                        style={{ color: "#7A6E63" }}
                      >
                        Password
                      </label>
                      
                        <a href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setStep("forgot-email");
                          setError("");
                          setSuccessMessage("");
                        }}
                        className="text-[10px] transition-colors duration-200"
                        style={{ color: "#B5ADA3" }}
                        onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
                        onMouseLeave={(e) => (e.target.style.color = "#B5ADA3")}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                      style={{
                        color: "#1b1c1a",
                        borderBottom: "1px solid #d0c5b5",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#C9A96E")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#d0c5b5")}
                    />
                  </div>

                 <button
                    type="submit"
                    disabled={loginBlockedUntil && Date.now() < loginBlockedUntil}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#1b1c1a",
                      color: "#fbf9f6",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!loginBlockedUntil || Date.now() >= loginBlockedUntil) {
                        e.currentTarget.style.backgroundColor = "#C9A96E";
                        e.currentTarget.style.color = "#1b1c1a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1b1c1a";
                      e.currentTarget.style.color = "#fbf9f6";
                    }}
                  >
                    {loginBlockedUntil && Date.now() < loginBlockedUntil ? "Try again later" : "Sign In"}
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px" style={{ backgroundColor: "#e4e2df" }} />
                    <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "#B5ADA3" }}>
                      or
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "#e4e2df" }} />
                  </div>

                  <ContinueWithGoogle />

                  <p className="text-center text-[11px]" style={{ color: "#B5ADA3" }}>
                    Don&apos;t have an account?{" "}
                    
                      <a href="/register"
                      className="transition-colors duration-200"
                      style={{
                        color: "#7A6E63",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
                      onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
                    >
                      Sign up
                    </a>
                  </p>
                </form>
              </>
            )}

            {/* ============ STEP: FORGOT PASSWORD - EMAIL ============ */}
            {step === "forgot-email" && (
              <>
                <div className="mb-12">
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] mb-4 font-medium"
                    style={{ color: "#C9A96E" }}
                  >
                    Reset Password
                  </p>
                  <h1
                    className="text-[2.6rem] xl:text-5xl font-light leading-[1.1]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#1b1c1a",
                    }}
                  >
                    Forgot Password?
                  </h1>
                </div>

                <p style={{ color: "#7A6E63", fontSize: "13px", marginBottom: "32px" }}>
                  Enter your email address and we'll send you a code to reset your password.
                </p>

                {error && (
                  <div
                    className="mb-6 p-4 rounded text-sm"
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#991f1f",
                      borderLeft: "3px solid #dc2626",
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleForgotEmailSubmit} className="flex flex-col gap-9">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="forgot-email"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="hello@example.com"
                      className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                      style={{
                        color: "#1b1c1a",
                        borderBottom: "1px solid #d0c5b5",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#C9A96E")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#d0c5b5")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-50"
                    style={{ backgroundColor: "#1b1c1a", color: "#fbf9f6" }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = "#C9A96E";
                        e.currentTarget.style.color = "#1b1c1a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1b1c1a";
                      e.currentTarget.style.color = "#fbf9f6";
                    }}
                  >
                    {loading ? "Sending OTP..." : "Send Reset Code"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#7A6E63",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontWeight: "500",
                      cursor: "pointer",
                      padding: "8px",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
                    onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
                  >
                    Back to Sign In
                  </button>
                </form>
              </>
            )}

            {/* ============ STEP: FORGOT PASSWORD - OTP ONLY ============ */}
            {step === "forgot-otp" && (
              <>
                <div className="mb-12">
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] mb-4 font-medium"
                    style={{ color: "#C9A96E" }}
                  >
                    Verify Email
                  </p>
                  <h1
                    className="text-[2.6rem] xl:text-5xl font-light leading-[1.1]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#1b1c1a",
                    }}
                  >
                    Enter OTP Code
                  </h1>
                </div>

                <p style={{ color: "#7A6E63", marginBottom: "8px", fontSize: "13px" }}>
                  Code sent to: {forgotEmail}
                </p>
                <p style={{ color: "#B5ADA3", fontSize: "12px", marginBottom: "24px" }}>
                  Expires in 3 minutes
                </p>

                {error && (
                  <div
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#991f1f",
                      borderLeft: "3px solid #dc2626",
                      padding: "16px",
                      borderRadius: "4px",
                      marginBottom: "24px",
                      fontSize: "14px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div
                    style={{
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      borderLeft: "3px solid #22c55e",
                      padding: "16px",
                      borderRadius: "4px",
                      marginBottom: "24px",
                      fontSize: "14px",
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <label
                      style={{
                        fontSize: "10px",
                        color: "#7A6E63",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        fontWeight: "500",
                      }}
                    >
                      Enter 6-Digit Code
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={otp[index] || ""}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          style={{
                            width: "48px",
                            height: "56px",
                            textAlign: "center",
                            fontSize: "24px",
                            fontWeight: "bold",
                            border: `2px solid ${otp[index] ? "#C9A96E" : "#b8a893"}`,
                            borderRadius: "8px",
                            backgroundColor: "#ffffff",
                            color: "#1b1c1a",
                            fontFamily: "'Inter', sans-serif",
                            outline: "none",
                            boxShadow: otp[index]
                              ? "0 0 0 3px rgba(201,169,110,0.15)"
                              : "0 1px 3px rgba(0,0,0,0.06)",
                            transition: "all 0.2s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#C9A96E";
                            e.target.style.boxShadow = "0 0 0 3px rgba(201,169,110,0.15)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = otp[index] ? "#C9A96E" : "#b8a893";
                            e.target.style.boxShadow = otp[index]
                              ? "0 0 0 3px rgba(201,169,110,0.15)"
                              : "0 1px 3px rgba(0,0,0,0.06)";
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-50"
                    style={{ backgroundColor: "#1b1c1a", color: "#fbf9f6" }}
                    onMouseEnter={(e) => {
                      if (!loading && otp.length === 6) {
                        e.currentTarget.style.backgroundColor = "#C9A96E";
                        e.currentTarget.style.color = "#1b1c1a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1b1c1a";
                      e.currentTarget.style.color = "#fbf9f6";
                    }}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>

                  <div style={{ borderTop: "1px solid #e4e2df", paddingTop: "16px" }}>
                    <p style={{ textAlign: "center", fontSize: "12px", color: "#7A6E63", marginBottom: "12px" }}>
                      Didn't receive code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendResetOtp}
                      disabled={loading}
                      className="w-full py-3 text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 disabled:opacity-50"
                      style={{ backgroundColor: "transparent", color: "#7A6E63", border: "1px solid #d0c5b5", borderRadius: "4px" }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = "#f5f3f0";
                          e.currentTarget.style.borderColor = "#C9A96E";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "#d0c5b5";
                      }}
                    >
                      {loading ? "Resending..." : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#7A6E63",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontWeight: "500",
                      cursor: "pointer",
                      padding: "8px",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
                    onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
                  >
                    Back to Sign In
                  </button>
                </form>
              </>
            )}

            {/* ============ STEP: FORGOT PASSWORD - NEW PASSWORD ============ */}
            {step === "forgot-newpass" && (
              <>
                <div className="mb-12">
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] mb-4 font-medium"
                    style={{ color: "#C9A96E" }}
                  >
                    Almost Done
                  </p>
                  <h1
                    className="text-[2.6rem] xl:text-5xl font-light leading-[1.1]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#1b1c1a",
                    }}
                  >
                    Set New Password
                  </h1>
                </div>

                {error && (
                  <div
                    className="mb-6 p-4 rounded text-sm"
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#991f1f",
                      borderLeft: "3px solid #dc2626",
                    }}
                  >
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div
                    className="mb-6 p-4 rounded text-sm"
                    style={{
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      borderLeft: "3px solid #22c55e",
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleNewPasswordSubmit} className="flex flex-col gap-9">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="new-password"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                      style={{
                        color: "#1b1c1a",
                        borderBottom: "1px solid #d0c5b5",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#C9A96E")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#d0c5b5")}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="confirm-new-password"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                      style={{
                        color: "#1b1c1a",
                        borderBottom: "1px solid #d0c5b5",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#C9A96E")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#d0c5b5")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-50"
                    style={{ backgroundColor: "#1b1c1a", color: "#fbf9f6" }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = "#C9A96E";
                        e.currentTarget.style.color = "#1b1c1a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1b1c1a";
                      e.currentTarget.style.color = "#fbf9f6";
                    }}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#7A6E63",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontWeight: "500",
                      cursor: "pointer",
                      padding: "8px",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
                    onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
                  >
                    Back to Sign In
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default Login;