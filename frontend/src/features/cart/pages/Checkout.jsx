import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hook/useAuth";
import { useCart } from "../hook/useCart";
import { useRazorpay } from "react-razorpay";

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
  success: "#5a7a5a",
  danger: "#c0392b",
};

const Checkout = () => {
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const { Razorpay } = useRazorpay();

  const {
    handleGetAddresses,
    handleAddAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
  } = useAuth();
  const { handleCreateCartOrder, handleVerifyCartOrder, handleGetCart } =
    useCart();

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const showAlert = (title, message) =>
    setAlertModal({ open: true, title, message });

  const [orderSuccessModal, setOrderSuccessModal] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState("address");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.contact || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    async function fetchAddresses() {
      setLoading(true);
      try {
        const data = await handleGetAddresses();
        setAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault) || data[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        if (data.length === 0) setIsAddingAddress(true);
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setForm({
      fullName: user?.fullName || "",
      phone: user?.contact || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const handleSaveAddress = async () => {
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.line1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      showAlert(
        "Missing Details",
        "Please fill in all required fields — Name, Phone, Address, City, State, and Pincode.",
      );
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      showAlert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit phone number.",
      );
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      showAlert("Invalid Pincode", "Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      let updated;
      if (editingAddressId) {
        updated = await handleUpdateAddress(editingAddressId, form);
      } else {
        updated = await handleAddAddress(form);
      }
      setAddresses(updated);
      const savedAddr = editingAddressId
        ? updated.find((a) => a._id === editingAddressId)
        : updated[updated.length - 1];
      if (savedAddr) setSelectedAddressId(savedAddr._id);
      setIsAddingAddress(false);
      setEditingAddressId(null);
      resetForm();
    } catch (err) {
      console.error("Failed to save address", err);
      showAlert(
        "Something Went Wrong",
        err?.response?.data?.message ||
          "Failed to save address. Please try again.",
      );
    }
  };

  const handleEditAddress = (address) => {
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setEditingAddressId(address._id);
    setIsAddingAddress(true);
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      const updated = await handleDeleteAddress(addressId);
      setAddresses(updated);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(updated[0]?._id || null);
      }
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  const handleConfirmAddress = () => {
    if (!selectedAddressId) {
      showAlert(
        "Address Required",
        "Please select or add a delivery address to continue.",
      );
      return;
    }
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        await handleCreateCartOrder(selectedAddressId, "cod");
        await handleGetCart();
        setOrderSuccessModal(true);
        return;
      }

      const order = await handleCreateCartOrder(selectedAddressId, "razorpay");

      const options = {
        key: "YOUR_RAZORPAY_KEY",
        amount: order.amount,
        currency: order.currency,
        name: "Snitch",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          const isValid = await handleVerifyCartOrder(response);
          if (isValid) {
            await handleGetCart();
            setOrderSuccessModal(true);
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.contact,
        },
        theme: { color: tokens.primary },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("Failed to place order", err);
      showAlert(
        "Order Failed",
        err?.response?.data?.message ||
          "We couldn't place your order. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };

  const formatCurrency = (amount, currency = "INR") =>
    `${currency} ${Number(amount || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: tokens.surface }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: tokens.outlineVariant,
              borderTopColor: tokens.primary,
            }}
          />
          <p
            className="text-[11px] uppercase tracking-[0.2em]"
            style={{ color: tokens.muted }}
          >
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  const subtotal = cart?.totalPrice || 0;
  const shippingFree = subtotal >= 15000;

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
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 pt-10 lg:pt-14">
          {/* Back */}
          <button
            onClick={() =>
              step === "payment" ? setStep("address") : navigate(-1)
            }
            className="flex items-center gap-2 mb-6 text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: tokens.secondary }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Title */}
          <h1
            className="font-light mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              color: tokens.onSurface,
            }}
          >
            Checkout
          </h1>
          <p className="text-[11px] mb-10" style={{ color: tokens.muted }}>
            {cart?.items?.length || 0}{" "}
            {cart?.items?.length === 1 ? "item" : "items"} · Secure checkout
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-12 max-w-sm">
            <StepDot
              active={step === "address" || step === "payment"}
              current={step === "address"}
              label="Address"
              number="1"
              done={step === "payment"}
            />
            <div
              className="flex-1 h-px mx-3 transition-colors duration-500"
              style={{
                backgroundColor:
                  step === "payment" ? tokens.primary : tokens.outlineVariant,
              }}
            />
            <StepDot
              active={step === "payment"}
              current={step === "payment"}
              label="Payment"
              number="2"
              done={false}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            {/* LEFT COLUMN */}
            <div className="w-full lg:w-[60%]">
              {step === "address" && (
                <div className="flex flex-col gap-6">
                  {/* Account card */}
                  <div
                    className="flex items-center gap-4 p-5"
                    style={{
                      backgroundColor: tokens.surfaceLow,
                      border: `1px solid ${tokens.surfaceHighest}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-medium"
                      style={{
                        backgroundColor: tokens.primary,
                        color: tokens.onSurface,
                      }}
                    >
                      {(user?.fullName?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: tokens.onSurface }}
                      >
                        {user?.fullName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: tokens.secondary }}
                      >
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Saved addresses */}
                  {!isAddingAddress && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p
                          className="text-[10px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: tokens.primary }}
                        >
                          Delivery Address
                        </p>
                        <button
                          onClick={() => {
                            resetForm();
                            setEditingAddressId(null);
                            setIsAddingAddress(true);
                          }}
                          className="flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
                          style={{ color: tokens.onSurface }}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Add New
                        </button>
                      </div>

                      {addresses.length === 0 ? (
                        <div
                          className="text-center py-10 px-6"
                          style={{ backgroundColor: tokens.surfaceLow }}
                        >
                          <p
                            className="text-sm mb-1"
                            style={{ color: tokens.onSurface }}
                          >
                            No saved addresses
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: tokens.muted }}
                          >
                            Add a delivery address to continue
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {addresses.map((addr) => {
                            const isSelected = selectedAddressId === addr._id;
                            return (
                              <label
                                key={addr._id}
                                className="flex items-start gap-3 p-5 cursor-pointer transition-all duration-200"
                                style={{
                                  backgroundColor: isSelected
                                    ? "#faf5ec"
                                    : tokens.surfaceLowest,
                                  border: `1px solid ${isSelected ? tokens.primary : tokens.outlineVariant}`,
                                  boxShadow: isSelected
                                    ? "0 4px 16px rgba(201,169,110,0.14)"
                                    : "none",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="address"
                                  checked={isSelected}
                                  onChange={() =>
                                    setSelectedAddressId(addr._id)
                                  }
                                  className="mt-1 accent-[#C9A96E]"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p
                                      className="text-sm font-medium"
                                      style={{ color: tokens.onSurface }}
                                    >
                                      {addr.fullName}
                                    </p>
                                    {addr.isDefault && (
                                      <span
                                        className="text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium"
                                        style={{
                                          backgroundColor: tokens.primary,
                                          color: tokens.onSurface,
                                        }}
                                      >
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: tokens.secondary }}
                                  >
                                    {addr.line1}
                                    {addr.line2 ? `, ${addr.line2}` : ""},{" "}
                                    {addr.city}, {addr.state} - {addr.pincode}
                                  </p>
                                  <p
                                    className="text-xs mt-1"
                                    style={{ color: tokens.secondary }}
                                  >
                                    {addr.phone}
                                  </p>

                                  <div className="flex gap-4 mt-3">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleEditAddress(addr);
                                      }}
                                      className="text-[10px] uppercase tracking-wider font-medium underline cursor-pointer hover:opacity-70"
                                      style={{ color: tokens.secondary }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveAddress(addr._id);
                                      }}
                                      className="text-[10px] uppercase tracking-wider font-medium underline cursor-pointer hover:opacity-70"
                                      style={{ color: tokens.danger }}
                                    >
                                      Remove
                                    </button>
                                    {!addr.isDefault && (
                                      <button
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          const updated =
                                            await handleSetDefaultAddress(
                                              addr._id,
                                            );
                                          setAddresses(updated);
                                        }}
                                        className="text-[10px] uppercase tracking-wider font-medium underline cursor-pointer hover:opacity-70"
                                        style={{ color: tokens.secondary }}
                                      >
                                        Set Default
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add/Edit address form */}
                  {isAddingAddress && (
                    <div
                      className="p-6 sm:p-7"
                      style={{
                        backgroundColor: tokens.surfaceLowest,
                        boxShadow: "0 8px 28px rgba(27,28,26,0.06)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <span
                          className="w-6 h-px"
                          style={{ backgroundColor: tokens.primary }}
                        />
                        <p
                          className="text-[10px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: tokens.primary }}
                        >
                          {editingAddressId
                            ? "Edit Address"
                            : "New Delivery Address"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 mb-5">
                        <FormField
                          label="Full Name"
                          value={form.fullName}
                          onChange={(v) => setForm({ ...form, fullName: v })}
                        />
                        <FormField
                          label="Phone Number"
                          value={form.phone}
                          onChange={(v) => setForm({ ...form, phone: v })}
                        />
                      </div>
                      <div className="mb-5">
                        <FormField
                          label="Address Line 1"
                          value={form.line1}
                          onChange={(v) => setForm({ ...form, line1: v })}
                        />
                      </div>
                      <div className="mb-5">
                        <FormField
                          label="Address Line 2 (Optional)"
                          value={form.line2}
                          onChange={(v) => setForm({ ...form, line2: v })}
                          required={false}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-5 mb-8">
                        <FormField
                          label="City"
                          value={form.city}
                          onChange={(v) => setForm({ ...form, city: v })}
                        />
                        <FormField
                          label="State"
                          value={form.state}
                          onChange={(v) => setForm({ ...form, state: v })}
                        />
                        <FormField
                          label="Pincode"
                          value={form.pincode}
                          onChange={(v) => setForm({ ...form, pincode: v })}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveAddress}
                          className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer transition-all duration-300"
                          style={{
                            backgroundColor: tokens.onSurface,
                            color: tokens.surface,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              tokens.primary;
                            e.currentTarget.style.color = tokens.onSurface;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              tokens.onSurface;
                            e.currentTarget.style.color = tokens.surface;
                          }}
                        >
                          Save Address
                        </button>
                        {addresses.length > 0 && (
                          <button
                            onClick={() => {
                              setIsAddingAddress(false);
                              setEditingAddressId(null);
                              resetForm();
                            }}
                            className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border cursor-pointer transition-colors"
                            style={{
                              borderColor: tokens.outlineVariant,
                              color: tokens.onSurface,
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {!isAddingAddress && (
                    <button
                      onClick={handleConfirmAddress}
                      className="w-full mt-2 py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: tokens.onSurface,
                        color: tokens.surface,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = tokens.primary;
                        e.currentTarget.style.color = tokens.onSurface;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          tokens.onSurface;
                        e.currentTarget.style.color = tokens.surface;
                      }}
                    >
                      Continue to Payment
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {step === "payment" && (
                <div>
                  <button
                    onClick={() => setStep("address")}
                    className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-medium mb-6 cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: tokens.secondary }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Address
                  </button>

                  {/* Selected address recap */}
                  {selectedAddressId && (
                    <div
                      className="mb-8 p-5 flex items-start justify-between gap-4"
                      style={{ backgroundColor: tokens.surfaceLow }}
                    >
                      {(() => {
                        const addr = addresses.find(
                          (a) => a._id === selectedAddressId,
                        );
                        if (!addr) return null;
                        return (
                          <>
                            <div className="min-w-0">
                              <p
                                className="text-[9px] uppercase tracking-[0.2em] font-medium mb-2"
                                style={{ color: tokens.primary }}
                              >
                                Delivering To
                              </p>
                              <p
                                className="text-sm font-medium mb-1"
                                style={{ color: tokens.onSurface }}
                              >
                                {addr.fullName}
                              </p>
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: tokens.secondary }}
                              >
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""},{" "}
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                            <button
                              onClick={() => setStep("address")}
                              className="text-[10px] uppercase tracking-wider font-medium underline cursor-pointer flex-shrink-0"
                              style={{ color: tokens.secondary }}
                            >
                              Change
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4"
                    style={{ color: tokens.primary }}
                  >
                    Payment Method
                  </p>

                  <div className="flex flex-col gap-3 mb-8">
                    <PaymentOption
                      selected={paymentMethod === "razorpay"}
                      onSelect={() => setPaymentMethod("razorpay")}
                      title="Pay Online"
                      subtitle="Card, UPI, Netbanking via Razorpay"
                      icon={
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={tokens.onSurface}
                          strokeWidth="1.5"
                        >
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <path d="M2 10h20" strokeLinecap="round" />
                        </svg>
                      }
                    />
                    <PaymentOption
                      selected={paymentMethod === "cod"}
                      onSelect={() => setPaymentMethod("cod")}
                      title="Cash on Delivery"
                      subtitle="Pay when your order arrives"
                      icon={
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={tokens.onSurface}
                          strokeWidth="1.5"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path
                            d="M12 8v4l3 2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    />
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: tokens.onSurface,
                      color: tokens.surface,
                    }}
                  >
                    {placing ? (
                      <>
                        <span
                          className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                          style={{
                            borderColor: "rgba(255,255,255,0.3)",
                            borderTopColor: tokens.surface,
                          }}
                        />
                        Placing Order...
                      </>
                    ) : paymentMethod === "cod" ? (
                      "Place Order"
                    ) : (
                      "Proceed to Pay"
                    )}
                  </button>

                  <p
                    className="text-[10px] text-center mt-4"
                    style={{ color: tokens.muted }}
                  >
                    By placing your order, you agree to our Terms &amp; Privacy
                    Policy
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN — Order Summary */}
            <div className="w-full lg:w-[40%]">
              <div
                className="sticky top-24 p-6 sm:p-8"
                style={{
                  backgroundColor: tokens.surfaceLowest,
                  boxShadow: "0 20px 40px rgba(27,28,26,0.05)",
                }}
              >
                <h2
                  className="font-light mb-5"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.5rem",
                    color: tokens.onSurface,
                  }}
                >
                  Order Summary
                </h2>
                <div
                  className="mb-5"
                  style={{ height: 1, backgroundColor: tokens.surfaceHighest }}
                />

                <div className="flex flex-col gap-4 mb-5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {cart?.items?.map((item) => {
                    const variantDetail = item.product?.variants;
                    const imageUrl =
                      variantDetail?.images?.[0]?.url ||
                      item.product?.images?.[0]?.url ||
                      "/snitch_editorial_warm.png";
                    const displayPrice = variantDetail?.discountedPrice?.amount
                      ? variantDetail.discountedPrice
                      : (item.price ??
                        variantDetail?.price ??
                        item.product?.price);

                    return (
                      <div key={item._id} className="flex gap-3">
                        <div
                          className="flex-shrink-0 overflow-hidden relative"
                          style={{
                            width: "52px",
                            height: "65px",
                            backgroundColor: tokens.surfaceHighest,
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-medium"
                            style={{
                              backgroundColor: tokens.onSurface,
                              color: tokens.surface,
                            }}
                          >
                            {item.quantity ?? 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs leading-snug line-clamp-2 mb-1"
                            style={{ color: tokens.onSurface }}
                          >
                            {item.product?.title}
                          </p>
                          <p
                            className="text-[10px] uppercase tracking-wider font-medium"
                            style={{ color: tokens.secondary }}
                          >
                            {displayPrice
                              ? formatCurrency(
                                  displayPrice.amount * (item.quantity ?? 1),
                                  displayPrice.currency,
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="mb-5"
                  style={{ height: 1, backgroundColor: tokens.surfaceHighest }}
                />

                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between items-baseline">
                    <span
                      className="text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: tokens.secondary }}
                    >
                      Subtotal
                    </span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: tokens.onSurface }}
                    >
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span
                      className="text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: tokens.secondary }}
                    >
                      Shipping
                    </span>
                    <span
                      className="text-[10px] uppercase"
                      style={{
                        color: shippingFree ? tokens.success : tokens.muted,
                      }}
                    >
                      {shippingFree ? "Complimentary" : "Free over INR 15,000"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span
                      className="text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: tokens.secondary }}
                    >
                      Duties &amp; Taxes
                    </span>
                    <span
                      className="text-[10px] uppercase"
                      style={{ color: tokens.muted }}
                    >
                      Included
                    </span>
                  </div>
                </div>

                <div
                  className="mb-5"
                  style={{ height: 1, backgroundColor: tokens.surfaceHighest }}
                />

                <div className="flex justify-between items-baseline mb-1">
                  <span
                    className="text-[10px] uppercase tracking-[0.22em] font-medium"
                    style={{ color: tokens.onSurface }}
                  >
                    Total
                  </span>
                  <span
                    className="text-lg font-medium"
                    style={{ color: tokens.onSurface }}
                  >
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 mt-6 pt-5"
                  style={{ borderTop: `1px solid ${tokens.surfaceHighest}` }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={tokens.muted}
                    strokeWidth="1.5"
                  >
                    <rect x="5" y="11" width="14" height="9" rx="1.5" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                  <span
                    className="text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: tokens.muted }}
                  >
                    Secure encrypted checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      {orderSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(27,28,26,0.55)" }}
        >
          <div
            className="w-full max-w-md text-center"
            style={{
              backgroundColor: tokens.surface,
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              animation: "alertPopIn 0.3s ease-out",
              padding: "48px 40px",
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "#faf5ec" }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.primary}
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2
              className="mb-3"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2rem",
                color: tokens.onSurface,
              }}
            >
              Thank You!
            </h2>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: tokens.secondary }}
            >
              Your order has been placed successfully. A confirmation email is
              on its way.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: tokens.onSurface,
                color: tokens.surface,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.primary;
                e.currentTarget.style.color = tokens.onSurface;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.onSurface;
                e.currentTarget.style.color = tokens.surface;
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(27,28,26,0.45)" }}
          onClick={() => setAlertModal({ open: false, title: "", message: "" })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm"
            style={{
              backgroundColor: tokens.surface,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
              animation: "alertPopIn 0.25s ease-out",
            }}
          >
            <div className="p-8">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: "#faf5ec" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={tokens.primary}
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-lg font-medium mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.5rem",
                  color: tokens.onSurface,
                }}
              >
                {alertModal.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-7"
                style={{ color: tokens.secondary }}
              >
                {alertModal.message}
              </p>
              <button
                onClick={() =>
                  setAlertModal({ open: false, title: "", message: "" })
                }
                className="w-full py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer transition-all duration-300"
                style={{
                  backgroundColor: tokens.onSurface,
                  color: tokens.surface,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.primary;
                  e.currentTarget.style.color = tokens.onSurface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.onSurface;
                  e.currentTarget.style.color = tokens.surface;
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes alertPopIn {
            from { opacity: 0; transform: scale(0.94) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #d0c5b5; border-radius: 4px; }
        `}
      </style>
    </>
  );
};

/* ─── Small reusable pieces ─── */

const StepDot = ({ current, done, label, number }) => (
  <div className="flex items-center gap-2.5">
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-300 flex-shrink-0"
      style={{
        backgroundColor: done
          ? tokens.primary
          : current
            ? tokens.onSurface
            : tokens.surfaceHighest,
        color: done
          ? tokens.onSurface
          : current
            ? tokens.surface
            : tokens.secondary,
        boxShadow: current ? "0 0 0 4px rgba(27,28,26,0.08)" : "none",
      }}
    >
      {done ? "✓" : number}
    </span>
    <span
      className="text-[11px] uppercase tracking-[0.18em] font-medium whitespace-nowrap"
      style={{ color: current || done ? tokens.onSurface : tokens.muted }}
    >
      {label}
    </span>
  </div>
);

const FormField = ({ label, value, onChange, required = true }) => (
  <div>
    <input
      placeholder={`${label}${required ? " *" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b py-2 text-sm focus:outline-none transition-colors"
      style={{ borderColor: tokens.outlineVariant, color: tokens.onSurface }}
      onFocus={(e) => (e.currentTarget.style.borderColor = tokens.primary)}
      onBlur={(e) =>
        (e.currentTarget.style.borderColor = tokens.outlineVariant)
      }
    />
  </div>
);

const PaymentOption = ({ selected, onSelect, title, subtitle, icon }) => (
  <label
    className="flex items-center gap-4 p-5 cursor-pointer transition-all duration-200"
    style={{
      backgroundColor: selected ? "#faf5ec" : tokens.surfaceLowest,
      border: `1px solid ${selected ? tokens.primary : tokens.outlineVariant}`,
      boxShadow: selected ? "0 4px 16px rgba(201,169,110,0.14)" : "none",
    }}
  >
    <input
      type="radio"
      name="payment"
      checked={selected}
      onChange={onSelect}
      className="accent-[#C9A96E]"
    />
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: tokens.surfaceLow }}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium" style={{ color: tokens.onSurface }}>
        {title}
      </p>
      <p className="text-xs" style={{ color: tokens.secondary }}>
        {subtitle}
      </p>
    </div>
  </label>
);

export default Checkout;
