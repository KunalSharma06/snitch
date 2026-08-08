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
  const { handleCreateCartOrder, handleVerifyCartOrder, handleGetCart } = useCart();

  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "" });

  const showAlert = (title, message) => {
    setAlertModal({ open: true, title, message });
  };

  const [orderSuccessModal, setOrderSuccessModal] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState("address"); // "address" | "payment"
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
    if (!form.fullName.trim() || !form.phone.trim() || !form.line1.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      showAlert("Missing Details", "Please fill in all required fields — Name, Phone, Address, City, State, and Pincode.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      showAlert("Invalid Phone Number", "Please enter a valid 10-digit phone number.");
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
      showAlert("Something Went Wrong", err?.response?.data?.message || "Failed to save address. Please try again.");
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
      showAlert("Address Required", "Please select or add a delivery address to continue.");
      return;
    }
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        const data = await handleCreateCartOrder(selectedAddressId, "cod");
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
      showAlert("Order Failed", err?.response?.data?.message || "We couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const formatCurrency = (amount, currency = "INR") =>
    `${currency} ${Number(amount).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: tokens.surface }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: tokens.muted }}
        >
          Loading checkout...
        </p>
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-12 lg:pt-16">
          <h1
            className="font-light mb-12"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: tokens.onSurface,
            }}
          >
            Checkout
          </h1>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-14">
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-300"
                style={{
                  backgroundColor:
                    step === "address" ? tokens.onSurface : tokens.primary,
                  color: step === "address" ? tokens.surface : tokens.onSurface,
                  boxShadow:
                    step === "address"
                      ? "0 0 0 4px rgba(27,28,26,0.08)"
                      : "none",
                }}
              >
                {step === "payment" ? "✓" : "1"}
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.18em] font-medium"
                style={{ color: tokens.onSurface }}
              >
                Address
              </span>
            </div>
            <div
              className="w-16 h-px transition-colors duration-500"
              style={{
                backgroundColor:
                  step === "payment" ? tokens.primary : tokens.outlineVariant,
              }}
            />
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-300"
                style={{
                  backgroundColor:
                    step === "payment"
                      ? tokens.onSurface
                      : tokens.surfaceHighest,
                  color: step === "payment" ? tokens.surface : tokens.secondary,
                  boxShadow:
                    step === "payment"
                      ? "0 0 0 4px rgba(27,28,26,0.08)"
                      : "none",
                }}
              >
                2
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.18em] font-medium"
                style={{
                  color: step === "payment" ? tokens.onSurface : tokens.muted,
                }}
              >
                Payment
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* LEFT: Address / Payment content */}
            <div className="w-full lg:w-[62%]">
              {step === "address" && (
                <div>
                  {/* User info */}
                  <div
                    className="mb-8 p-6"
                    style={{ backgroundColor: tokens.surfaceLow }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3"
                      style={{ color: tokens.primary }}
                    >
                      Account
                    </p>
                    <p
                      className="text-sm mb-1"
                      style={{ color: tokens.onSurface }}
                    >
                      {user?.fullName}
                    </p>
                    <p className="text-sm" style={{ color: tokens.secondary }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Saved addresses */}
                  {!isAddingAddress && (
                    <div className="mb-6">
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
                          className="text-[11px] uppercase tracking-[0.15em] underline cursor-pointer"
                          style={{ color: tokens.onSurface }}
                        >
                          + Add New
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {addresses.map((addr) => (
                          <label
                            key={addr._id}
                            className="flex items-start gap-3 p-5 cursor-pointer transition-all duration-200"
                            style={{
                              backgroundColor: selectedAddressId === addr._id ? "#faf5ec" : tokens.surfaceLowest,
                              border: `1px solid ${selectedAddressId === addr._id ? tokens.primary : tokens.outlineVariant}`,
                              boxShadow: selectedAddressId === addr._id ? "0 6px 20px rgba(201,169,110,0.12)" : "none",
                            }}
                          >
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === addr._id}
                              onChange={() => setSelectedAddressId(addr._id)}
                              className="mt-1 accent-[#C9A96E]"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p
                                  className="text-sm font-medium"
                                  style={{ color: tokens.onSurface }}
                                >
                                  {addr.fullName}
                                </p>
                                {addr.isDefault && (
                                  <span
                                    className="text-[9px] uppercase tracking-wider px-2 py-0.5"
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
                                className="text-xs"
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

                              <div className="flex gap-4 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleEditAddress(addr);
                                  }}
                                  className="text-[10px] uppercase tracking-wider underline cursor-pointer"
                                  style={{ color: tokens.secondary }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveAddress(addr._id);
                                  }}
                                  className="text-[10px] uppercase tracking-wider underline cursor-pointer"
                                  style={{ color: "#c0392b" }}
                                >
                                  Remove
                                </button>
                                {!addr.isDefault && (
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      const updated =
                                        await handleSetDefaultAddress(addr._id);
                                      setAddresses(updated);
                                    }}
                                    className="text-[10px] uppercase tracking-wider underline cursor-pointer"
                                    style={{ color: tokens.secondary }}
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add/Edit address form */}
                  {isAddingAddress && (
                    <div
                      className="p-7"
                      style={{
                        backgroundColor: tokens.surfaceLowest,
                        boxShadow: "0 12px 32px rgba(27,28,26,0.06)",
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input
                          placeholder="Full Name *"
                          value={form.fullName}
                          onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                          }
                          className="bg-transparent border-b py-2 text-sm focus:outline-none"
                          style={{
                            borderColor: tokens.outlineVariant,
                            color: tokens.onSurface,
                          }}
                        />
                        <input
                          placeholder="Phone Number *"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
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
                        value={form.line1}
                        onChange={(e) =>
                          setForm({ ...form, line1: e.target.value })
                        }
                        className="w-full bg-transparent border-b py-2 text-sm focus:outline-none mb-4"
                        style={{
                          borderColor: tokens.outlineVariant,
                          color: tokens.onSurface,
                        }}
                      />
                      <input
                        placeholder="Address Line 2 (Optional)"
                        value={form.line2}
                        onChange={(e) =>
                          setForm({ ...form, line2: e.target.value })
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
                          value={form.city}
                          onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                          }
                          className="bg-transparent border-b py-2 text-sm focus:outline-none"
                          style={{
                            borderColor: tokens.outlineVariant,
                            color: tokens.onSurface,
                          }}
                        />
                        <input
                          placeholder="State"
                          value={form.state}
                          onChange={(e) =>
                            setForm({ ...form, state: e.target.value })
                          }
                          className="bg-transparent border-b py-2 text-sm focus:outline-none"
                          style={{
                            borderColor: tokens.outlineVariant,
                            color: tokens.onSurface,
                          }}
                        />
                        <input
                          placeholder="Pincode"
                          value={form.pincode}
                          onChange={(e) =>
                            setForm({ ...form, pincode: e.target.value })
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
                          className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer"
                          style={{
                            backgroundColor: tokens.onSurface,
                            color: tokens.surface,
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
                            className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border cursor-pointer"
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
                      className="w-full mt-8 py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300"
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
                    </button>
                  )}
                </div>
              )}

              {step === "payment" && (
                <div>
                  <button
                    onClick={() => setStep("address")}
                    className="text-[11px] uppercase tracking-[0.2em] underline mb-6 cursor-pointer"
                    style={{ color: tokens.secondary }}
                  >
                    ← Back to Address
                  </button>

                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4"
                    style={{ color: tokens.primary }}
                  >
                    Payment Method
                  </p>

                  <div className="flex flex-col gap-3 mb-8">
                    <label
                      className="flex items-center gap-3 p-5 cursor-pointer transition-colors"
                      style={{
                        backgroundColor:
                          paymentMethod === "razorpay"
                            ? "#faf5ec"
                            : tokens.surfaceLowest,
                        border: `1px solid ${paymentMethod === "razorpay" ? tokens.primary : tokens.outlineVariant}`,
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")}
                        className="accent-[#C9A96E]"
                      />
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: tokens.onSurface }}
                        >
                          Pay Online
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: tokens.secondary }}
                        >
                          Card, UPI, Netbanking via Razorpay
                        </p>
                      </div>
                    </label>

                    <label
                      className="flex items-center gap-3 p-5 cursor-pointer transition-colors"
                      style={{
                        backgroundColor:
                          paymentMethod === "cod"
                            ? "#faf5ec"
                            : tokens.surfaceLowest,
                        border: `1px solid ${paymentMethod === "cod" ? tokens.primary : tokens.outlineVariant}`,
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#C9A96E]"
                      />
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: tokens.onSurface }}
                        >
                          Cash on Delivery
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: tokens.secondary }}
                        >
                          Pay when your order arrives
                        </p>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300 disabled:opacity-50"
                    style={{
                      backgroundColor: tokens.onSurface,
                      color: tokens.surface,
                    }}
                  >
                    {placing
                      ? "Placing Order..."
                      : paymentMethod === "cod"
                        ? "Place Order"
                        : "Proceed to Pay"}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Order summary */}
            <div className="w-full lg:w-[38%]">
              <div
                className="p-8 sticky top-28"
                style={{
                  backgroundColor: tokens.surfaceLowest,
                  boxShadow: "0 20px 40px rgba(27,28,26,0.04)",
                }}
              >
                <h2
                  className="font-light mb-6"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.5rem",
                    color: tokens.onSurface,
                  }}
                >
                  Order Summary
                </h2>
                <div
                  className="mb-6"
                  style={{ height: 1, backgroundColor: tokens.surfaceHighest }}
                />
                <div className="flex flex-col gap-4 mb-6 max-h-80 overflow-y-auto pr-1">
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
                          className="flex-shrink-0 overflow-hidden"
                          style={{
                            width: "56px",
                            height: "70px",
                            backgroundColor: tokens.surfaceHighest,
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs leading-snug line-clamp-2 mb-1"
                            style={{ color: tokens.onSurface }}
                          >
                            {item.product?.title}
                          </p>
                          <p
                            className="text-[10px] uppercase tracking-wider mb-1"
                            style={{ color: tokens.secondary }}
                          >
                            Qty: {item.quantity ?? 1}
                          </p>
                          <p
                            className="text-[10px] uppercase tracking-wider font-medium"
                            style={{ color: tokens.onSurface }}
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
                  className="mb-6"
                  style={{ height: 1, backgroundColor: tokens.surfaceHighest }}
                />
                <div className="flex justify-between items-baseline">
                  <span
                    className="text-[10px] uppercase tracking-[0.22em] font-medium"
                    style={{ color: tokens.onSurface }}
                  >
                    Total
                  </span>
                  <span
                    className="text-base uppercase tracking-[0.18em] font-medium"
                    style={{ color: tokens.onSurface }}
                  >
                    {formatCurrency(cart?.totalPrice)}
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tokens.primary} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2
              className="mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: tokens.onSurface }}
            >
              Thank You!
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: tokens.secondary }}>
              Your order has been placed successfully. A confirmation email is on its way.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300"
              style={{ backgroundColor: tokens.onSurface, color: tokens.surface }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.primary; e.currentTarget.style.color = tokens.onSurface; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.onSurface; e.currentTarget.style.color = tokens.surface; }}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.primary} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3
                className="text-lg font-medium mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: tokens.onSurface }}
              >
                {alertModal.title}
              </h3>
              <p className="text-sm leading-relaxed mb-7" style={{ color: tokens.secondary }}>
                {alertModal.message}
              </p>
              <button
                onClick={() => setAlertModal({ open: false, title: "", message: "" })}
                className="w-full py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer transition-all duration-300"
                style={{ backgroundColor: tokens.onSurface, color: tokens.surface }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.primary; e.currentTarget.style.color = tokens.onSurface; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.onSurface; e.currentTarget.style.color = tokens.surface; }}
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
        `}
      </style>
    </>
  );
};

export default Checkout;
