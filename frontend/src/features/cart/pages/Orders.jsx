import React, { useEffect, useState } from "react";
import { useCart } from "../hook/useCart";
import { useNavigate } from "react-router";
import { socket } from "../../../lib/socket";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceLowest: "#ffffff",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  secondary: "#7A6E63",
  muted: "#B5ADA3",
  primary: "#C9A96E",
};

const STATUS_LABELS = {
  pending: "Payment Pending",
  paid: "Confirmed",
  failed: "Payment Failed",
  cod_pending: "Confirmed (COD)",
  cod_delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  pending: "#B5ADA3",
  paid: "#2e7d32",
  failed: "#c0392b",
  cod_pending: "#2e7d32",
  cod_delivered: "#2e7d32",
  cancelled: "#c0392b",
};

const FULFILLMENT_LABELS = {
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const FULFILLMENT_COLORS = {
  processing: "#B58A3D",
  shipped: "#2563eb",
  out_for_delivery: "#7c3aed",
  delivered: "#2e7d32",
  cancelled: "#c0392b",
};

const Orders = () => {
  const { handleGetUserOrders, handleCancelOrder } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await handleGetUserOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  fetchOrders();
}, []);

useEffect(() => {
  const handleOrderUpdate = (data) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === data.orderId
          ? {
              ...order,
              fulfillmentStatus: data.fulfillmentStatus,
              status: data.status,
            }
          : order,
      ),
    );
  };
  socket.on("orderStatusUpdated", handleOrderUpdate);

  return () => {
    socket.off("orderStatusUpdated", handleOrderUpdate);
  };
}, []);

  const canCancel = (order) => {
    if (["cancelled", "cod_delivered", "failed"].includes(order.status))
      return false;
    const hours = (Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60);
    return hours <= 24;
  };

 const openCancelModal = (orderId) => {
   setCancelModal({ open: true, orderId });
 };

 const closeCancelModal = () => {
   setCancelModal({ open: false, orderId: null });
 };

 const confirmCancel = async () => {
   const orderId = cancelModal.orderId;
   setCancellingId(orderId);
   closeCancelModal();
   try {
     await handleCancelOrder(orderId);
     await fetchOrders();
   } catch (err) {
     alert(err?.response?.data?.message || "Could not cancel order");
   } finally {
     setCancellingId(null);
   }
 };

  const formatCurrency = (amount, currency = "INR") =>
    `${currency} ${Number(amount).toLocaleString("en-IN")}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

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
          Loading orders...
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
        <div className="max-w-5xl mx-auto px-8 lg:px-16 pt-8 lg:pt-10">
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
            className="font-light mb-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: tokens.onSurface,
            }}
          >
            Your Orders
          </h1>

          {orders.length === 0 ? (
            <div className="py-24 text-center">
              <p
                className="text-lg mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: tokens.onSurface,
                }}
              >
                No orders yet.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer"
                style={{
                  backgroundColor: tokens.onSurface,
                  color: tokens.surface,
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 sm:p-6 md:p-8 rounded-sm transition-all duration-300"
                  style={{
                    backgroundColor: tokens.surfaceLowest,
                    border: `1px solid ${tokens.surfaceHighest}`,
                  }}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-5"
                    style={{
                      borderBottom: `1px solid ${tokens.surfaceHighest}`,
                    }}
                  >
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1"
                        style={{ color: tokens.onSurface }}
                      >
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p
                        className="text-[10px] uppercase tracking-[0.15em]"
                        style={{ color: tokens.muted }}
                      >
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      {order.estimatedDelivery && (
                        <div className="mt-1">
                          {(() => {
                            const isDelivered =
                              order.fulfillmentStatus === "delivered";
                            const isCancelled =
                              order.status === "cancelled" ||
                              order.fulfillmentStatus === "cancelled";
                            const estDate = new Date(order.estimatedDelivery);
                            const now = new Date();
                            const daysLate = Math.floor(
                              (now - estDate) / (1000 * 60 * 60 * 24),
                            );
                            const isDelayed =
                              !isDelivered && !isCancelled && daysLate > 0;

                            if (isDelayed) {
                              return (
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#c0392b"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                  <p
                                    className="text-[10px] uppercase tracking-[0.15em] font-medium"
                                    style={{ color: "#c0392b" }}
                                  >
                                    Delivery delayed by {daysLate}{" "}
                                    {daysLate === 1 ? "day" : "days"} — sorry,
                                    we'll deliver shortly
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <p
                                className="text-[10px] uppercase tracking-[0.15em]"
                                style={{ color: tokens.secondary }}
                              >
                                Estimated delivery:{" "}
                                {formatDate(order.estimatedDelivery)}
                              </p>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5">
                      <span
                        className="text-[10px] uppercase tracking-[0.15em] font-bold px-3 py-1.5"
                        style={{
                          color: STATUS_COLORS[order.status],
                          backgroundColor: "#f5f3f0",
                        }}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      {order.fulfillmentStatus &&
                        order.status !== "cancelled" && (
                          <span
                            className="text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-1"
                            style={{
                              color:
                                FULFILLMENT_COLORS[order.fulfillmentStatus] ||
                                tokens.secondary,
                              backgroundColor: "transparent",
                              border: `1px solid ${FULFILLMENT_COLORS[order.fulfillmentStatus] || tokens.secondary}`,
                            }}
                          >
                            {FULFILLMENT_LABELS[order.fulfillmentStatus] ||
                              order.fulfillmentStatus}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mb-5">
                    {order.orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          item.productId &&
                          navigate(`/product/${item.productId}`)
                        }
                        className="flex gap-4 cursor-pointer group"
                      >
                        <div
                          className="flex-shrink-0 overflow-hidden"
                          style={{
                            width: "56px",
                            height: "70px",
                            backgroundColor: tokens.surfaceHighest,
                          }}
                        >
                          <img
                            src={
                              item.images?.[0]?.url ||
                              "/snitch_editorial_warm.png"
                            }
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-sm transition-colors duration-200 group-hover:text-[#C9A96E]"
                            style={{ color: tokens.onSurface }}
                          >
                            {item.title}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: tokens.secondary }}
                          >
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: tokens.onSurface }}
                        >
                          {formatCurrency(
                            item.price.amount * item.quantity,
                            item.price.currency,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: `1px solid ${tokens.surfaceHighest}` }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: tokens.onSurface }}
                    >
                      Total:{" "}
                      {formatCurrency(order.price.amount, order.price.currency)}
                    </p>
                    {canCancel(order) && (
                      <button
                        onClick={() => openCancelModal(order._id)}
                        disabled={cancellingId === order._id}
                        className="text-[11px] uppercase tracking-[0.15em] underline cursor-pointer disabled:opacity-50"
                        style={{ color: "#c0392b" }}
                      >
                        {cancellingId === order._id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(27,28,26,0.55)" }}
        >
          <div
            className="w-full max-w-sm text-center"
            style={{
              backgroundColor: tokens.surface,
              border: `1px solid ${tokens.surfaceHighest}`,
              boxShadow: "0 20px 40px rgba(27,28,26,0.08)",
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
              Cancel Order?
            </h3>
            <p
              className="text-[11px] leading-relaxed mb-8"
              style={{ color: tokens.secondary }}
            >
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={closeCancelModal}
                className="flex-1 py-3 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-300 border cursor-pointer"
                style={{
                  backgroundColor: "transparent",
                  borderColor: tokens.outlineVariant || "#d0c5b5",
                  color: tokens.secondary,
                }}
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: "#c0392b",
                  color: "#fff",
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
