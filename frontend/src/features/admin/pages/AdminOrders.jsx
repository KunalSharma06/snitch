import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../hook/useAdmin";

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

const FULFILLMENT_OPTIONS = [
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

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

const getPaymentBadge = (order) => {
  if (order.paymentMethod === "cod") {
    return { label: "Cash on Delivery", color: "#7A6E63", bg: "#f5f3f0" };
  }
  if (order.status === "paid") {
    return { label: "Paid Online", color: "#2e7d32", bg: "#eaf6ea" };
  }
  if (order.status === "failed") {
    return { label: "Payment Failed", color: "#c0392b", bg: "#fdf0ee" };
  }
  return { label: "Payment Pending", color: "#B5ADA3", bg: "#f5f3f0" };
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const {
    handleGetAllOrders,
    handleUpdateFulfillmentStatus,
    handleGetAdminStats,
  } = useAdmin();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await handleGetAllOrders({
        status: statusFilter,
        search,
        page,
        limit: 20,
      });
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await handleGetAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (search === "") {
      setPage(1);
      fetchOrders();
    }
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleFulfillmentChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await handleUpdateFulfillmentStatus(orderId, newStatus);
      await fetchOrders();
      await fetchStats();
    } catch (err) {
      alert(
        err?.response?.data?.message || "Failed to update fulfillment status",
      );
    } finally {
      setUpdatingId(null);
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

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen pb-16 sm:pb-24"
        style={{
          backgroundColor: tokens.surface,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-6 sm:pt-12 lg:pt-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-5 sm:mb-8 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
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

          <h1
            className="font-light mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              color: tokens.onSurface,
            }}
          >
            Order Management
          </h1>
          <p
            className="text-xs sm:text-sm mb-6 sm:mb-10"
            style={{ color: tokens.secondary }}
          >
            View and manage all customer orders
          </p>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
              {[
                { label: "Total Orders", value: stats.totalOrders },
                { label: "Revenue", value: formatCurrency(stats.totalRevenue) },
                {
                  label: "COD Pending",
                  value: stats.statusCounts?.cod_pending || 0,
                },
                {
                  label: "Cancelled",
                  value: stats.statusCounts?.cancelled || 0,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-3.5 sm:p-5"
                  style={{
                    backgroundColor: tokens.surfaceLowest,
                    boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
                  }}
                >
                  <p
                    className="text-[8px] sm:text-[9px] uppercase tracking-wider mb-1.5 sm:mb-2 truncate"
                    style={{ color: tokens.muted }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-lg sm:text-2xl font-light truncate"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: tokens.onSurface,
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div
            className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6 sm:mb-8 items-stretch sm:items-center pb-5 sm:pb-6"
            style={{ borderBottom: `1px solid ${tokens.surfaceHighest}` }}
          >
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-[11px] uppercase tracking-wider border cursor-pointer bg-transparent w-full sm:w-auto"
              style={{
                borderColor: tokens.surfaceHighest,
                color: tokens.onSurface,
              }}
            >
              <option value="all">All Orders</option>
              <option value="cod_pending">COD Pending</option>
              <option value="paid">Paid Online</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Payment Failed</option>
            </select>

            <form
              onSubmit={handleSearch}
              className="flex gap-2 flex-1 sm:min-w-[280px]"
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or order ID"
                className="flex-1 min-w-0 px-4 py-2.5 text-xs border bg-transparent focus:outline-none"
                style={{
                  borderColor: tokens.surfaceHighest,
                  color: tokens.onSurface,
                }}
              />
              <button
                type="submit"
                className="flex-shrink-0 px-4 sm:px-5 py-2.5 text-[10px] uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: tokens.onSurface,
                  color: tokens.surface,
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Orders list */}
          {loading ? (
            <p className="text-xs" style={{ color: tokens.muted }}>
              Loading orders...
            </p>
          ) : orders.length === 0 ? (
            <p className="text-sm" style={{ color: tokens.secondary }}>
              No orders found.
            </p>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-5">
              {orders.map((order) => {
                const paymentBadge = getPaymentBadge(order);
                const fulfillment = order.fulfillmentStatus || "processing";

                return (
                  <div
                    key={order._id}
                    className="p-4 sm:p-6"
                    style={{
                      backgroundColor: tokens.surfaceLowest,
                      boxShadow: "0 6px 20px rgba(27,28,26,0.05)",
                      border: `1px solid ${tokens.surfaceHighest}`,
                    }}
                  >
                    {/* Top row: customer + order meta + price + payment badge */}
                    <div
                      className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5"
                      style={{
                        borderBottom: `1px solid ${tokens.surfaceHighest}`,
                      }}
                    >
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium mb-1 truncate"
                          style={{ color: tokens.onSurface }}
                        >
                          {order.user?.fullName || "Unknown user"}
                        </p>
                        <p
                          className="text-xs mb-2 truncate"
                          style={{ color: tokens.secondary }}
                        >
                          {order.user?.email}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5"
                            style={{
                              backgroundColor: tokens.surfaceLow,
                              color: tokens.onSurface,
                            }}
                          >
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: tokens.muted }}
                          >
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                        <p
                          className="text-base sm:text-lg font-medium"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: tokens.onSurface,
                          }}
                        >
                          {formatCurrency(
                            order.price.amount,
                            order.price.currency,
                          )}
                        </p>
                        <span
                          className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold px-2 sm:px-2.5 py-1 whitespace-nowrap"
                          style={{
                            color: paymentBadge.color,
                            backgroundColor: paymentBadge.bg,
                          }}
                        >
                          {paymentBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 mb-4 sm:mb-5 -mx-1 px-1">
                      {order.orderItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 flex items-center gap-2 sm:gap-2.5"
                        >
                          <div
                            className="w-10 h-12 sm:w-11 sm:h-14 overflow-hidden"
                            style={{ backgroundColor: tokens.surfaceHighest }}
                          >
                            <img
                              src={
                                item.images?.[0]?.url ||
                                "/snitch_editorial_warm.png"
                              }
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p
                              className="text-[10px] sm:text-[11px] max-w-[90px] sm:max-w-[120px] truncate"
                              style={{ color: tokens.onSurface }}
                            >
                              {item.title}
                            </p>
                            <p
                              className="text-[9px] sm:text-[10px]"
                              style={{ color: tokens.muted }}
                            >
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom row: address + fulfillment control */}
                    <div
                      className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4"
                      style={{
                        borderTop: `1px solid ${tokens.surfaceHighest}`,
                      }}
                    >
                      <div className="flex items-start gap-2 sm:max-w-md">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={tokens.muted}
                          strokeWidth="1.5"
                          className="mt-0.5 flex-shrink-0"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: tokens.secondary }}
                        >
                          {order.address?.line1}
                          {order.address?.line2
                            ? `, ${order.address.line2}`
                            : ""}
                          , {order.address?.city}, {order.address?.state} -{" "}
                          {order.address?.pincode}
                          <br />
                          <span style={{ color: tokens.muted }}>
                            {order.address?.phone}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <span
                          className="text-[9px] uppercase tracking-wider"
                          style={{ color: tokens.muted }}
                        >
                          Fulfillment:
                        </span>
                        {fulfillment === "cancelled" ||
                        order.status === "cancelled" ? (
                          <span
                            className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5"
                            style={{
                              color: FULFILLMENT_COLORS.cancelled,
                              backgroundColor: "#fdf0ee",
                            }}
                          >
                            Cancelled
                          </span>
                        ) : fulfillment === "delivered" ? (
                          <span
                            className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5"
                            style={{
                              color: FULFILLMENT_COLORS.delivered,
                              backgroundColor: "#eaf6ea",
                            }}
                          >
                            Delivered
                          </span>
                        ) : (
                          <select
                            value={fulfillment}
                            disabled={updatingId === order._id}
                            onChange={(e) =>
                              handleFulfillmentChange(order._id, e.target.value)
                            }
                            className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 border cursor-pointer disabled:opacity-50 max-w-full"
                            style={{
                              borderColor: FULFILLMENT_COLORS[fulfillment],
                              color: FULFILLMENT_COLORS[fulfillment],
                              backgroundColor: "transparent",
                            }}
                          >
                            {FULFILLMENT_OPTIONS.filter(
                              (s) => s !== "cancelled",
                            ).map((s) => (
                              <option key={s} value={s}>
                                {FULFILLMENT_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-8 sm:mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 sm:px-4 py-2 text-[10px] uppercase tracking-wider border cursor-pointer disabled:opacity-30"
                style={{
                  borderColor: tokens.surfaceHighest,
                  color: tokens.onSurface,
                }}
              >
                Previous
              </button>
              <span
                className="text-[10px] uppercase tracking-wider self-center whitespace-nowrap"
                style={{ color: tokens.secondary }}
              >
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 sm:px-4 py-2 text-[10px] uppercase tracking-wider border cursor-pointer disabled:opacity-30"
                style={{
                  borderColor: tokens.surfaceHighest,
                  color: tokens.onSurface,
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
