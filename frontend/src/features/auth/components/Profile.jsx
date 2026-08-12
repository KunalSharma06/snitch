import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth.js";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceLowest: "#ffffff",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  secondary: "#7A6E63",
  muted: "#B5ADA3",
  primary: "#C9A96E",
  outlineVariant: "#d0c5b5",
};

const emptyAddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

const EMAIL_OTP_STORAGE_KEY = "snitch_pending_email_change";

const Profile = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const {
    handleUpdateProfile,
    handleGetAddresses,
    handleAddAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
    handleRequestEmailChangeOTP,
    handleVerifyEmailChangeOTP,
  } = useAuth();

  // Personal info edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    contact: user?.contact || "",
  });

  // Email OTP state
  const [otpModal, setOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  // Address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressError, setAddressError] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const data = await handleGetAddresses();
        setAddresses(data);
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, []);

  // Restore pending email-change OTP state after reload
  useEffect(() => {
    const raw = localStorage.getItem(EMAIL_OTP_STORAGE_KEY);
    if (!raw) return;

    try {
      const { email, expiresAt } = JSON.parse(raw);
      const remaining = Math.floor((expiresAt - Date.now()) / 1000);

      if (remaining > 0) {
        setPendingEmail(email);
        setForm((f) => ({ ...f, email }));
        setOtpTimer(remaining);
        setOtpModal(true);
        setIsEditing(true);
      } else {
        localStorage.removeItem(EMAIL_OTP_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(EMAIL_OTP_STORAGE_KEY);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const otherAddresses = addresses.filter((a) => a._id !== defaultAddress?._id);

  // ---- Personal info handlers ----
  const startEdit = () => {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      contact: user?.contact || "",
    });
    setError("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.contact.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(form.contact.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setError("");
    const emailChanged = form.email.trim() !== user?.email;

    setSaving(true);
    try {
      if (form.fullName !== user?.fullName || form.contact !== user?.contact) {
        await handleUpdateProfile({
          fullName: form.fullName,
          contact: form.contact,
        });
      }

      if (emailChanged) {
        setSendingOtp(true);
        await handleRequestEmailChangeOTP(form.email.trim());
        setSendingOtp(false);

        const expiresAt = Date.now() + 180 * 1000;
        localStorage.setItem(
          EMAIL_OTP_STORAGE_KEY,
          JSON.stringify({ email: form.email.trim(), expiresAt }),
        );

        setPendingEmail(form.email.trim());
        setOtpTimer(180);
        setOtpModal(true);
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save changes. Please try again.",
      );
      setSendingOtp(false);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue.trim() || otpValue.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    setVerifyingOtp(true);
    setOtpError("");
    try {
      await handleVerifyEmailChangeOTP(pendingEmail, otpValue.trim());
      localStorage.removeItem(EMAIL_OTP_STORAGE_KEY);
      setOtpModal(false);
      setOtpValue("");
      setPendingEmail("");
      setIsEditing(false);
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    try {
      await handleRequestEmailChangeOTP(pendingEmail);
      const expiresAt = Date.now() + 180 * 1000;
      localStorage.setItem(
        EMAIL_OTP_STORAGE_KEY,
        JSON.stringify({ email: pendingEmail, expiresAt }),
      );
      setOtpTimer(180);
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const cancelOtpModal = () => {
    localStorage.removeItem(EMAIL_OTP_STORAGE_KEY);
    setOtpModal(false);
    setOtpValue("");
    setOtpError("");
    setOtpTimer(0);
    setPendingEmail("");
    setForm((f) => ({ ...f, email: user?.email || "" }));
  };

  // ---- Address handlers ----
  const openAddAddress = () => {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setAddressError("");
    setIsAddingAddress(true);
  };

  const openEditAddress = (addr) => {
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setEditingAddressId(addr._id);
    setAddressError("");
    setIsAddingAddress(true);
  };

  const cancelAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setAddressError("");
  };

  const handleSaveAddress = async () => {
    const f = addressForm;
    if (
      !f.fullName.trim() ||
      !f.phone.trim() ||
      !f.line1.trim() ||
      !f.city.trim() ||
      !f.state.trim() ||
      !f.pincode.trim()
    ) {
      setAddressError("Please fill in all required fields.");
      return;
    }
    if (!/^\d{10}$/.test(f.phone.trim())) {
      setAddressError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{6}$/.test(f.pincode.trim())) {
      setAddressError("Please enter a valid 6-digit pincode.");
      return;
    }

    setSavingAddress(true);
    setAddressError("");
    try {
      let updated;
      if (editingAddressId) {
        updated = await handleUpdateAddress(editingAddressId, f);
      } else {
        updated = await handleAddAddress(f);
      }
      setAddresses(updated);
      cancelAddressForm();
    } catch (err) {
      setAddressError(
        err?.response?.data?.message ||
          "Failed to save address. Please try again.",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleRemoveAddress = async (addressId) => {
    setRemovingId(addressId);
    try {
      const updated = await handleDeleteAddress(addressId);
      setAddresses(updated);
    } catch (err) {
      console.error("Failed to delete address", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleMakeDefault = async (addressId) => {
    try {
      const updated = await handleSetDefaultAddress(addressId);
      setAddresses(updated);
    } catch (err) {
      console.error("Failed to set default address", err);
    }
  };

  const renderAddressCard = (addr) => (
    <div
      key={addr._id}
      className="p-5"
      style={{ backgroundColor: tokens.surfaceLow }}
    >
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm font-medium" style={{ color: tokens.onSurface }}>
          {addr.fullName}
        </p>
        {addr.isDefault && (
          <span
            className="text-[9px] uppercase tracking-wider px-2 py-0.5"
            style={{ backgroundColor: tokens.primary, color: tokens.onSurface }}
          >
            Default
          </span>
        )}
      </div>
      <p className="text-xs mb-1" style={{ color: tokens.secondary }}>
        {addr.line1}
        {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} -{" "}
        {addr.pincode}
      </p>
      <p className="text-xs mb-4" style={{ color: tokens.secondary }}>
        {addr.phone}
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => openEditAddress(addr)}
          className="text-[10px] uppercase tracking-wider underline cursor-pointer"
          style={{ color: tokens.secondary }}
        >
          Edit
        </button>
        <button
          onClick={() => handleRemoveAddress(addr._id)}
          disabled={removingId === addr._id}
          className="text-[10px] uppercase tracking-wider underline cursor-pointer disabled:opacity-50"
          style={{ color: "#c0392b" }}
        >
          {removingId === addr._id ? "Removing..." : "Remove"}
        </button>
        {!addr.isDefault && (
          <button
            onClick={() => handleMakeDefault(addr._id)}
            className="text-[10px] uppercase tracking-wider underline cursor-pointer"
            style={{ color: tokens.secondary }}
          >
            Set Default
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen pb-24"
        style={{
          backgroundColor: tokens.surface,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-2xl mx-auto px-8 lg:px-16 pt-8 lg:pt-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-[10px] uppercase tracking-[0.2em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: tokens.secondary }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1
            className="font-light mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: tokens.onSurface,
            }}
          >
            Your Profile
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] mb-10" style={{ color: tokens.secondary }}>
            Manage your personal information
          </p>

          {/* Personal Information */}
          <div
            className="p-8 md:p-10 rounded-sm transition-all duration-300"
            style={{
              backgroundColor: tokens.surfaceLowest,
              border: `1px solid ${tokens.surfaceHighest}`,
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <p
                className="text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{ color: tokens.primary }}
              >
                Personal Information
              </p>
              {!isEditing && (
                <button
                  onClick={startEdit}
                  className="text-[11px] uppercase tracking-[0.15em] underline cursor-pointer"
                  style={{ color: tokens.onSurface }}
                >
                  Edit
                </button>
              )}
            </div>

            {error && (
              <div
                className="mb-6 p-3 text-xs"
                style={{ backgroundColor: "#fdf0ee", color: "#c0392b" }}
              >
                {error}
              </div>
            )}

            {!isEditing ? (
              <div className="flex flex-col gap-6">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: tokens.muted }}
                  >
                    Full Name
                  </p>
                  <p className="text-sm" style={{ color: tokens.onSurface }}>
                    {user?.fullName}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: tokens.muted }}
                  >
                    Email
                  </p>
                  <p className="text-sm" style={{ color: tokens.onSurface }}>
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: tokens.muted }}
                  >
                    Phone
                  </p>
                  <p className="text-sm" style={{ color: tokens.onSurface }}>
                    {user?.contact || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-2"
                    style={{ color: tokens.muted }}
                  >
                    Full Name
                  </p>
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    disabled={otpModal}
                    className="w-full bg-transparent border-b py-2 text-sm focus:outline-none disabled:opacity-50"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-2"
                    style={{ color: tokens.muted }}
                  >
                    Email
                  </p>
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    disabled={otpModal}
                    className="w-full bg-transparent border-b py-2 text-sm focus:outline-none disabled:opacity-50"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                  {otpModal && (
                    <p
                      className="text-[10px] mt-2"
                      style={{ color: tokens.primary }}
                    >
                      Verification pending for this email
                    </p>
                  )}
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-2"
                    style={{ color: tokens.muted }}
                  >
                    Phone
                  </p>
                  <input
                    value={form.contact}
                    onChange={(e) =>
                      setForm({ ...form, contact: e.target.value })
                    }
                    disabled={otpModal}
                    className="w-full bg-transparent border-b py-2 text-sm focus:outline-none disabled:opacity-50"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                </div>

                {!otpModal && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving || sendingOtp}
                      className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer disabled:opacity-50"
                      style={{
                        backgroundColor: tokens.onSurface,
                        color: tokens.surface,
                      }}
                    >
                      {sendingOtp
                        ? "Sending OTP..."
                        : saving
                          ? "Saving..."
                          : "Save Changes"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving || sendingOtp}
                      className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border cursor-pointer"
                      style={{
                        borderColor: tokens.outlineVariant,
                        color: tokens.onSurface,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Addresses */}
          <div
            className="mt-6 p-8 md:p-10 rounded-sm transition-all duration-300"
            style={{
              backgroundColor: tokens.surfaceLowest,
              border: `1px solid ${tokens.surfaceHighest}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <p
                className="text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{ color: tokens.primary }}
              >
                Delivery Addresses
              </p>
              {!isAddingAddress && (
                <button
                  onClick={openAddAddress}
                  className="text-[11px] uppercase tracking-[0.15em] underline cursor-pointer"
                  style={{ color: tokens.onSurface }}
                >
                  + Add New
                </button>
              )}
            </div>

            {isAddingAddress && (
              <div className="mb-6">
                {addressError && (
                  <div
                    className="mb-4 p-3 text-xs"
                    style={{ backgroundColor: "#fdf0ee", color: "#c0392b" }}
                  >
                    {addressError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    placeholder="Full Name *"
                    value={addressForm.fullName}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        fullName: e.target.value,
                      })
                    }
                    className="bg-transparent border-b py-2 text-sm focus:outline-none"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                  <input
                    placeholder="Phone Number *"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    className="bg-transparent border-b py-2 text-sm focus:outline-none"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                </div>
                <input
                  placeholder="Address Line 1 *"
                  value={addressForm.line1}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, line1: e.target.value })
                  }
                  className="w-full bg-transparent border-b py-2 text-sm focus:outline-none mb-4"
                  style={{
                    borderColor: tokens.outlineVariant,
                    color: tokens.onSurface,
                  }}
                />
                <input
                  placeholder="Address Line 2 (Optional)"
                  value={addressForm.line2}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, line2: e.target.value })
                  }
                  className="w-full bg-transparent border-b py-2 text-sm focus:outline-none mb-4"
                  style={{
                    borderColor: tokens.outlineVariant,
                    color: tokens.onSurface,
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <input
                    placeholder="City *"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="bg-transparent border-b py-2 text-sm focus:outline-none"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                  <input
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    className="bg-transparent border-b py-2 text-sm focus:outline-none"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                  <input
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value,
                      })
                    }
                    className="bg-transparent border-b py-2 text-sm focus:outline-none"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                    className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: tokens.onSurface,
                      color: tokens.surface,
                    }}
                  >
                    {savingAddress
                      ? "Saving..."
                      : editingAddressId
                        ? "Update Address"
                        : "Save Address"}
                  </button>
                  <button
                    onClick={cancelAddressForm}
                    disabled={savingAddress}
                    className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border cursor-pointer"
                    style={{
                      borderColor: tokens.outlineVariant,
                      color: tokens.onSurface,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!isAddingAddress && (
              <>
                {loadingAddresses ? (
                  <p className="text-xs" style={{ color: tokens.muted }}>
                    Loading addresses...
                  </p>
                ) : !defaultAddress ? (
                  <p className="text-sm" style={{ color: tokens.secondary }}>
                    No delivery address saved yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {renderAddressCard(defaultAddress)}
                    {showAllAddresses &&
                      otherAddresses.map((addr) => renderAddressCard(addr))}
                    {otherAddresses.length > 0 && (
                      <button
                        onClick={() => setShowAllAddresses((prev) => !prev)}
                        className="text-[10px] uppercase tracking-wider underline cursor-pointer self-start"
                        style={{ color: tokens.secondary }}
                      >
                        {showAllAddresses
                          ? "Show Less"
                          : `+${otherAddresses.length} more saved address${otherAddresses.length > 1 ? "es" : ""}`}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Email Change OTP Modal */}
      {otpModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(27,28,26,0.55)" }}
        >
          <div
            className="w-full max-w-sm text-center"
            style={{
              backgroundColor: tokens.surface,
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              padding: "40px 32px",
            }}
          >
            <h3
              className="font-light text-2xl mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: tokens.onSurface,
              }}
            >
              Verify Your Email
            </h3>
            <p
              className="text-xs leading-relaxed mb-2"
              style={{ color: tokens.secondary }}
            >
              We've sent a 6-digit code to <strong>{pendingEmail}</strong>.
              Enter it below to confirm the change.
            </p>
            <p
              className="text-[10px] leading-relaxed mb-6"
              style={{ color: tokens.muted }}
            >
              Don't see it? Please also check your{" "}
              <strong>Spam / Junk folder</strong>.
            </p>

            {otpError && (
              <div
                className="mb-4 p-3 text-xs"
                style={{ backgroundColor: "#fdf0ee", color: "#c0392b" }}
              >
                {otpError}
              </div>
            )}

            <input
              value={otpValue}
              onChange={(e) =>
                setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full text-center bg-transparent border-b py-3 text-lg tracking-[0.3em] focus:outline-none mb-4"
              style={{
                borderColor: tokens.outlineVariant,
                color: tokens.onSurface,
              }}
            />

            <p
              className="text-[10px] uppercase tracking-wider mb-6"
              style={{ color: tokens.muted }}
            >
              {otpTimer > 0 ? (
                <>Expires in {formatTimer(otpTimer)}</>
              ) : (
                <>
                  OTP expired.{" "}
                  <button
                    onClick={handleResendOtp}
                    className="underline cursor-pointer"
                    style={{ color: tokens.primary }}
                  >
                    Resend
                  </button>
                </>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpTimer <= 0}
                className="flex-1 py-3 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: tokens.onSurface,
                  color: tokens.surface,
                }}
              >
                {verifyingOtp ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={cancelOtpModal}
                disabled={verifyingOtp}
                className="flex-1 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border cursor-pointer"
                style={{
                  borderColor: tokens.outlineVariant,
                  color: tokens.onSurface,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
