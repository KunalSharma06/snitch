import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

/* ─── Design tokens ─── */
const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceHigh: "#eae8e5",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  onSurfaceVariant: "#4d463a",
  secondary: "#7A6E63",
  muted: "#B5ADA3",
  primary: "#C9A96E",
  primaryLight: "#e8d9bb",
  outlineVariant: "#d0c5b5",
};

const getDisplayImage = (product, variant) => {
  if (variant?.images?.length) return variant.images[0].url;
  if (product?.images?.length) return product.images[0].url;
  return null;
};

const formatPrice = (currency, amount) => {
  if (amount == null) return "—";
  return `${currency || "INR"} ${Number(amount).toLocaleString("en-IN")}`;
};

const generateOrderId = () => {
  const ts = Date.now().toString().slice(-6);
  return `SNT-${ts}`;
};

const OrderSuccess = () => {
  const cart = useSelector((state) => state.cart);
  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice;
  const currency = cart?.currency || "INR";

  const [visible, setVisible] = useState(false);
  const orderId = React.useMemo(() => generateOrderId(), []);
  const orderDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen"
        style={{
          backgroundColor: tokens.surface,
          fontFamily: "'Inter', sans-serif",
          color: tokens.onSurface,
        }}
      >
        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row min-h-screen">

          {/* ════ LEFT PANEL ════ */}
          <div
            className="lg:w-[52%] flex flex-col justify-between px-12 md:px-20 lg:px-28 pt-16 pb-20"
            style={{ backgroundColor: tokens.surface }}
          >
            {/* Top: brand mark */}
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.35em] font-medium"
                style={{ color: tokens.primary }}
              >
                Snitch
              </p>
            </div>

            {/* Center: thank you block */}
            <div
              className="left-content py-20"
              style={{ opacity: visible ? 1 : 0, transition: "opacity 0.9s ease, transform 0.9s ease", transform: visible ? "translateY(0)" : "translateY(20px)" }}
            >
              {/* Animated check */}
              <div className="flex items-center gap-4 mb-12">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: tokens.primaryLight }}
                >
                  <svg className="w-5 h-5" fill="none" stroke={tokens.primary} viewBox="0 0 24 24">
                    <path
                      className="check-draw"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.3em] font-medium"
                  style={{ color: tokens.primary }}
                >
                  Order Confirmed
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-light leading-[1.1] mb-8"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.8rem, 5vw, 4.2rem)",
                  color: tokens.onSurface,
                }}
              >
                Thank you<br />
                <em style={{ color: tokens.secondary }}>for your order.</em>
              </h1>

              <p
                className="text-sm leading-[2] mb-14 max-w-sm"
                style={{ color: tokens.secondary }}
              >
                Your selected pieces are being carefully prepared at our atelier.
                A shipping confirmation and tracking link will be dispatched as soon as your parcel departs.
              </p>

              {/* Order meta cards */}
              <div className="flex gap-5 mb-14 flex-wrap">
                <div
                  className="px-6 py-5 border flex-1 min-w-[130px]"
                  style={{ borderColor: tokens.outlineVariant, backgroundColor: tokens.surfaceLow }}
                >
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: tokens.muted }}>Order ID</p>
                  <p className="text-sm font-mono font-medium" style={{ color: tokens.onSurface }}>{orderId}</p>
                </div>
                <div
                  className="px-5 py-4 border flex-1 min-w-[120px]"
                  style={{ borderColor: tokens.outlineVariant, backgroundColor: tokens.surfaceLow }}
                >
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: tokens.muted }}>Date</p>
                  <p className="text-sm font-medium" style={{ color: tokens.onSurface }}>{orderDate}</p>
                </div>
                <div
                  className="px-5 py-4 border flex-1 min-w-[120px]"
                  style={{ borderColor: tokens.outlineVariant, backgroundColor: tokens.surfaceLow }}
                >
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: tokens.muted }}>Status</p>
                  <p className="text-sm font-medium" style={{ color: "#6B9E7A" }}>Processing</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/"
                  className="px-8 py-3.5 text-[10px] uppercase tracking-[0.25em] font-medium transition-all duration-300"
                  style={{ backgroundColor: tokens.onSurface, color: tokens.surface }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.primary;
                    e.currentTarget.style.color = tokens.onSurface;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.onSurface;
                    e.currentTarget.style.color = tokens.surface;
                  }}
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/cart"
                  className="px-8 py-3.5 text-[10px] uppercase tracking-[0.25em] font-medium border transition-all duration-300"
                  style={{ backgroundColor: "transparent", borderColor: tokens.outlineVariant, color: tokens.onSurface }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = tokens.primary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.outlineVariant; }}
                >
                  View Cart
                </Link>
              </div>
            </div>

            {/* Bottom: footnote */}
            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: tokens.muted }}>
              © {new Date().getFullYear()} Snitch — All Rights Reserved
            </p>
          </div>

          {/* ════ DIVIDER ════ */}
          <div className="hidden lg:block w-px self-stretch" style={{ backgroundColor: tokens.outlineVariant }} />

          {/* ════ RIGHT PANEL ════ */}
          <div
            className="lg:w-[48%] flex flex-col px-10 md:px-14 lg:px-16 pt-16 pb-20 order-summary-panel"
            style={{ backgroundColor: tokens.surfaceLow, opacity: visible ? 1 : 0, transition: "opacity 1.1s ease 0.2s" }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-12">
              <h2
                className="text-base font-light shrink-0 uppercase tracking-[0.2em]"
                style={{ color: tokens.onSurface }}
              >
                Order Summary
              </h2>
              <div className="flex-1 h-px" style={{ backgroundColor: tokens.surfaceHighest }} />
              <span
                className="text-[10px] uppercase tracking-[0.15em] shrink-0"
                style={{ color: tokens.muted }}
              >
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-8 mb-12" style={{ maxHeight: "58vh" }}>
              {items.length === 0 ? (
                <div
                  className="border px-6 py-10 text-center"
                  style={{ borderColor: tokens.outlineVariant }}
                >
                  <p className="text-xs uppercase tracking-[0.18em]" style={{ color: tokens.muted }}>
                    No items in this order.
                  </p>
                </div>
              ) : (
                items.map((item, idx) => {
                  const { product, variant: variantId, price, quantity, _id } = item;
                  const variantDetail = product?.variants;
                  const imageUrl = getDisplayImage(product, variantDetail);
                  const displayPrice = price ?? variantDetail?.price ?? product?.price;
                  const attributes = variantDetail?.attributes ?? {};
                  const attrParts = Object.entries(attributes).map(([k, v]) => `${v}`).join(" / ");

                  return (
                    <div
                      key={_id || idx}
                      className="flex gap-6 item-row"
                      style={{ animationDelay: `${0.3 + idx * 0.08}s` }}
                    >
                      {/* Image */}
                      <div
                        className="shrink-0 overflow-hidden"
                        style={{ width: 88, height: 110, backgroundColor: tokens.surfaceHigh }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ color: tokens.muted }}
                          >
                            <svg className="w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                        <div>
                          <p
                            className="text-sm font-medium leading-snug mb-1 truncate"
                            style={{ color: tokens.onSurface }}
                          >
                            {product?.title || "Product"}
                          </p>
                          {attrParts && (
                            <p
                              className="text-[10px] uppercase tracking-[0.13em]"
                              style={{ color: tokens.muted }}
                            >
                              {attrParts}
                            </p>
                          )}
                        </div>
                        <p
                          className="text-[10px] uppercase tracking-[0.13em]"
                          style={{ color: tokens.secondary }}
                        >
                          Qty · {quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="shrink-0 flex flex-col justify-center">
                        <p className="text-xs font-medium" style={{ color: tokens.onSurface }}>
                          {formatPrice(displayPrice?.currency, displayPrice?.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Totals block */}
            <div
              className="border-t pt-8 flex flex-col gap-5"
              style={{ borderColor: tokens.outlineVariant }}
            >
              <div className="flex justify-between text-xs" style={{ color: tokens.secondary }}>
                <span className="uppercase tracking-[0.15em]">Subtotal</span>
                <span>{formatPrice(currency, totalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: tokens.secondary }}>
                <span className="uppercase tracking-[0.15em]">Shipping</span>
                <span className="uppercase tracking-[0.1em]" style={{ color: "#6B9E7A" }}>Complimentary</span>
              </div>

              <div
                className="flex justify-between items-center pt-5 mt-2 border-t"
                style={{ borderColor: tokens.surfaceHighest }}
              >
                <span
                  className="text-[10px] uppercase tracking-[0.22em] font-medium"
                  style={{ color: tokens.onSurface }}
                >
                  Total
                </span>
                <span
                  className="text-base font-medium"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: tokens.onSurface,
                  }}
                >
                  {formatPrice(currency, totalPrice)}
                </span>
              </div>
            </div>

            {/* Decorative footnote */}
            <p
              className="text-[9px] uppercase tracking-[0.2em] mt-14"
              style={{ color: tokens.muted }}
            >
              Questions? Contact us at support@snitch.in
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .check-draw {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: drawCheck 0.6s ease forwards 0.7s;
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        .item-row {
          animation: slideIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default OrderSuccess;