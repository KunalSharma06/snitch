import React, { useState, useRef } from "react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router";

const RegisterOTP = () => {
  // const { handleRequestOTP, handleVerifyOTP, handleResendOTP } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    isSeller: false,
  });

  const [otpData, setOtpData] = useState({
    otp: "",
    email: "",
  });

  const otpInputsRef = useRef([]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = otpData.otp.split("");
    newOtp[index] = value;
    const otpString = newOtp.join("").slice(0, 6);
    setOtpData((prev) => ({ ...prev, otp: otpString }));
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpData.otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await handleRequestOTP({
        fullName: formData.fullName,
        email: formData.email,
        contact: formData.contact || null,
        password: formData.password,
        isSeller: formData.isSeller,
      });

      setOtpData((prev) => ({ ...prev, email: formData.email, otp: "" }));
      setSuccessMessage("OTP sent to your email!");
      setStep("otp");
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!otpData.otp || otpData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      await handleVerifyOTP(otpData.email, otpData.otp);
      setSuccessMessage("Email verified! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await handleResendOTP(otpData.email, formData.fullName);
      setSuccessMessage("New OTP sent to your email");
      setOtpData((prev) => ({ ...prev, otp: "" }));
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || "Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setError("");
    setOtpData((prev) => ({ ...prev, otp: "" }));
    setSuccessMessage("");
  };

  const inputStyle = {
    color: "#1b1c1a",
    borderBottom: "1px solid #d0c5b5",
    fontFamily: "'Inter', sans-serif",
  };

  const handleFocus = (e) => {
    e.target.style.borderBottomColor = "#C9A96E";
  };

  const handleBlur = (e) => {
    e.target.style.borderBottomColor = "#d0c5b5";
  };

  return (
    <>
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
              }}
            >
              Snitch.
            </span>
            <div>
              <p
                className="text-5xl xl:text-6xl font-light leading-[1.08] text-white mb-5"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Define your
                <br />
                aesthetic
              </p>
              <p
                className="text-sm font-light leading-relaxed max-w-xs"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Join the exclusive movement of creators and brands redefining
                the modern fashion landscape.
              </p>
            </div>
          </div>
        </div>

        <div
          className="w-full lg:w-1/2 flex items-center justify-center min-h-screen px-8 sm:px-14 lg:px-20 py-16 overflow-y-auto"
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

            {step === "form" && (
              <>
                <div className="mb-12">
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] mb-4 font-medium"
                    style={{ color: "#C9A96E" }}
                  >
                    Welcome to Snitch
                  </p>
                  <h1
                    className="text-[2.6rem] xl:text-5xl font-light leading-[1.1]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#1b1c1a",
                    }}
                  >
                    Create Account
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

                <form
                  onSubmit={handleRequestOTP}
                  className="flex flex-col gap-9"
                >
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="fullName"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      required
                      placeholder="John Doe"
                      className="w-full bg-transparent outline-none py-3 text-sm"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      placeholder="hello@example.com"
                      className="w-full bg-transparent outline-none py-3 text-sm"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Contact Number
                    </label>
                    <input
                      id="contact"
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleFormChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-transparent outline-none py-3 text-sm"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="password"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter password"
                      className="w-full bg-transparent outline-none py-3 text-sm"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-[10px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: "#7A6E63" }}
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      required
                      placeholder="Confirm password"
                      className="w-full bg-transparent outline-none py-3 text-sm"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>

                  <label
                    htmlFor="isSeller"
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    <input
                      id="isSeller"
                      type="checkbox"
                      name="isSeller"
                      checked={formData.isSeller}
                      onChange={handleFormChange}
                      className="w-4 h-4"
                    />
                    <span
                      className="text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "#7A6E63" }}
                    >
                      Register as Seller
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-50"
                    style={{
                      backgroundColor: "#1b1c1a",
                      color: "#fbf9f6",
                    }}
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
                    {loading ? "Sending OTP..." : "Get OTP"}
                  </button>

                  <p
                    style={{
                      color: "#B5ADA3",
                      textAlign: "center",
                      fontSize: "11px",
                    }}
                  >
                    Already have an account?{" "}
                    <a href="/login" style={{ color: "#7A6E63" }}>
                      Sign in
                    </a>
                  </p>
                </form>
              </>
            )}

            {step === "otp" && (
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

                <p style={{ color: "#7A6E63", marginBottom: "8px" }}>
                  Code sent to: {otpData.email}
                </p>
                <p
                  style={{
                    color: "#B5ADA3",
                    fontSize: "12px",
                    marginBottom: "24px",
                  }}
                >
                  Expires in 10 minutes
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

                <form
                  onSubmit={handleVerifyOTP}
                  className="flex flex-col gap-8"
                >
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
                          maxLength="1"
                          value={otpData.otp[index] || ""}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          style={{
                            width: "48px",
                            height: "56px",
                            textAlign: "center",
                            fontSize: "24px",
                            fontWeight: "bold",
                            borderBottom: `2px solid ${
                              otpData.otp[index] ? "#C9A96E" : "#d0c5b5"
                            }`,
                            backgroundColor: "transparent",
                            color: "#1b1c1a",
                            fontFamily: "'Inter', sans-serif",
                            border: "none",
                            outline: "none",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderBottomColor = "#C9A96E";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderBottomColor = otpData.otp[
                              index
                            ]
                              ? "#C9A96E"
                              : "#d0c5b5";
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpData.otp.length !== 6}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-50"
                    style={{
                      backgroundColor: "#1b1c1a",
                      color: "#fbf9f6",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && otpData.otp.length === 6) {
                        e.currentTarget.style.backgroundColor = "#C9A96E";
                        e.currentTarget.style.color = "#1b1c1a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1b1c1a";
                      e.currentTarget.style.color = "#fbf9f6";
                    }}
                  >
                    {loading ? "Verifying..." : "Verify and Create Account"}
                  </button>

                  <div
                    style={{
                      borderTop: "1px solid #e4e2df",
                      paddingTop: "16px",
                    }}
                  >
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#7A6E63",
                        marginBottom: "12px",
                      }}
                    >
                      Didn't receive code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="w-full py-3 text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 disabled:opacity-50"
                      style={{
                        backgroundColor: "transparent",
                        color: "#7A6E63",
                        border: "1px solid #d0c5b5",
                        borderRadius: "4px",
                      }}
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
                    onClick={handleBackToForm}
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
                    Back to Registration
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterOTP;
