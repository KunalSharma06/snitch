// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
// import { useAdmin } from "../hook/useAdmin";
// import {
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
// } from "recharts";

// const tokens = {
//   surface: "#fbf9f6",
//   surfaceLow: "#f5f3f0",
//   surfaceLowest: "#ffffff",
//   surfaceHighest: "#e4e2df",
//   onSurface: "#1b1c1a",
//   secondary: "#7A6E63",
//   muted: "#B5ADA3",
//   primary: "#C9A96E",
// };

// const PIE_COLORS = ["#C9A96E", "#2563eb", "#7c3aed", "#2e7d32", "#c0392b"];
// const RANGE_OPTIONS = [
//   { label: "7 Days", value: "7" },
//   { label: "30 Days", value: "30" },
//   { label: "90 Days", value: "90" },
// ];

// const TrendBadge = ({ change }) => {
//   const isPositive = change >= 0;
//   return (
//     <span
//       className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5"
//       style={{
//         color: isPositive ? "#2e7d32" : "#c0392b",
//         backgroundColor: isPositive ? "#eaf6ea" : "#fdf0ee",
//       }}
//     >
//       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isPositive ? "none" : "rotate(180deg)" }}>
//         <path d="M12 19V5M5 12l7-7 7 7" />
//       </svg>
//       {Math.abs(change)}%
//     </span>
//   );
// };

// const StatCard = ({ label, value, change, sparkData, sparkKey }) => (
//   <div className="p-6" style={{ backgroundColor: tokens.surfaceLowest, boxShadow: "0 6px 20px rgba(27,28,26,0.04)" }}>
//     <div className="flex items-start justify-between mb-3">
//       <p className="text-[9px] uppercase tracking-wider" style={{ color: tokens.muted }}>{label}</p>
//       {change !== undefined && <TrendBadge change={change} />}
//     </div>
//     <p className="text-2xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: tokens.onSurface }}>
//       {value}
//     </p>
//     {sparkData && sparkData.length > 1 && (
//       <ResponsiveContainer width="100%" height={36}>
//         <LineChart data={sparkData}>
//           <Line type="monotone" dataKey={sparkKey} stroke={tokens.primary} strokeWidth={1.5} dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     )}
//   </div>
// );

// const AdminAnalytics = () => {
//   const navigate = useNavigate();
//   const { handleGetAnalytics } = useAdmin();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [range, setRange] = useState("30");

//   useEffect(() => {
//     async function fetchAnalytics() {
//       setLoading(true);
//       try {
//         const result = await handleGetAnalytics(range);
//         setData(result);
//       } catch (err) {
//         console.error("Failed to fetch analytics", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchAnalytics();
//   }, [range]);

//   const formatCurrency = (amount) => `INR ${Number(amount).toLocaleString("en-IN")}`;

//   const formatDateShort = (dateStr) => {
//     const d = new Date(dateStr);
//     return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: tokens.surface }}>
//         <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: tokens.surfaceHighest, borderTopColor: tokens.primary }} />
//         <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: tokens.muted }}>Crunching the numbers...</p>
//       </div>
//     );
//   }

//   const revenueData = (data?.revenueByDay || []).map((d) => ({ date: formatDateShort(d._id), revenue: d.revenue, orders: d.orders }));
//   const signupsData = (data?.signupsByDay || []).map((d) => ({ date: formatDateShort(d._id), signups: d.count }));
//   const fulfillmentData = (data?.ordersByFulfillment || []).map((d) => ({ name: d._id || "unknown", value: d.count }));

//   const hasAnyData = revenueData.length > 0 || signupsData.length > 0;

//   return (
//     <>
//       <link
//         href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
//         rel="stylesheet"
//       />
//       <div className="min-h-screen pb-24" style={{ backgroundColor: tokens.surface, fontFamily: "'Inter', sans-serif" }}>
//         <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-12 lg:pt-16">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
//             style={{ color: tokens.secondary }}
//           >
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M19 12H5M12 19l-7-7 7-7" />
//             </svg>
//             Back
//           </button>

//           <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
//             <div>
//               <h1 className="font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: tokens.onSurface }}>
//                 Analytics
//               </h1>
//               <p className="text-sm" style={{ color: tokens.secondary }}>
//                 Performance overview and business insights
//               </p>
//             </div>

//             <div className="flex gap-1 p-1" style={{ backgroundColor: tokens.surfaceLow }}>
//               {RANGE_OPTIONS.map((opt) => (
//                 <button
//                   key={opt.value}
//                   onClick={() => setRange(opt.value)}
//                   className="px-4 py-2 text-[10px] uppercase tracking-wider font-medium cursor-pointer transition-all duration-200"
//                   style={{
//                     backgroundColor: range === opt.value ? tokens.onSurface : "transparent",
//                     color: range === opt.value ? tokens.surface : tokens.secondary,
//                   }}
//                 >
//                   {opt.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {!hasAnyData ? (
//             <div className="py-24 text-center">
//               <p className="text-lg mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: tokens.onSurface }}>
//                 No data yet for this period
//               </p>
//               <p className="text-sm" style={{ color: tokens.secondary }}>
//                 Analytics will appear here as orders and signups come in.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* KPI cards with sparklines and trend badges */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
//                 <StatCard
//                   label={`Revenue (${range}d)`}
//                   value={formatCurrency(data.revenue.current)}
//                   change={data.revenue.change}
//                   sparkData={revenueData}
//                   sparkKey="revenue"
//                 />
//                 <StatCard
//                   label={`Orders (${range}d)`}
//                   value={data.orders.current}
//                   change={data.orders.change}
//                   sparkData={revenueData}
//                   sparkKey="orders"
//                 />
//                 <StatCard
//                   label="Avg. Order Value"
//                   value={formatCurrency(data.avgOrderValue)}
//                 />
//                 <StatCard
//                   label={`New Signups (${range}d)`}
//                   value={data.signups.current}
//                   change={data.signups.change}
//                   sparkData={signupsData}
//                   sparkKey="signups"
//                 />
//               </div>

//               {/* Revenue trend - large area chart */}
//               <div className="p-6 mb-8" style={{ backgroundColor: tokens.surfaceLowest, boxShadow: "0 6px 20px rgba(27,28,26,0.04)" }}>
//                 <div className="flex items-center justify-between mb-6">
//                   <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: tokens.primary }}>
//                     Revenue Trend
//                   </p>
//                   <p className="text-xs" style={{ color: tokens.muted }}>
//                     {formatCurrency(data.revenue.current)} total
//                   </p>
//                 </div>
//                 <ResponsiveContainer width="100%" height={280}>
//                   <AreaChart data={revenueData}>
//                     <defs>
//                       <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor={tokens.primary} stopOpacity={0.35} />
//                         <stop offset="95%" stopColor={tokens.primary} stopOpacity={0} />
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" stroke={tokens.surfaceHighest} vertical={false} />
//                     <XAxis dataKey="date" tick={{ fontSize: 11, fill: tokens.secondary }} axisLine={{ stroke: tokens.surfaceHighest }} tickLine={false} />
//                     <YAxis tick={{ fontSize: 11, fill: tokens.secondary }} axisLine={false} tickLine={false} />
//                     <Tooltip
//                       formatter={(value, name) => [name === "revenue" ? formatCurrency(value) : value, name === "revenue" ? "Revenue" : "Orders"]}
//                       contentStyle={{ fontSize: 12, borderRadius: 0, border: `1px solid ${tokens.surfaceHighest}`, backgroundColor: tokens.surfaceLowest }}
//                     />
//                     <Area type="monotone" dataKey="revenue" stroke={tokens.primary} strokeWidth={2} fill="url(#revenueGradient)" dot={{ r: 3, fill: tokens.primary }} activeDot={{ r: 5 }} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//                 {/* Fulfillment breakdown */}
//                 <div className="p-6" style={{ backgroundColor: tokens.surfaceLowest, boxShadow: "0 6px 20px rgba(27,28,26,0.04)" }}>
//                   <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-6" style={{ color: tokens.primary }}>
//                     Orders by Fulfillment Stage
//                   </p>
//                   {fulfillmentData.length > 0 ? (
//                     <ResponsiveContainer width="100%" height={260}>
//                       <PieChart>
//                         <Pie data={fulfillmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
//                           {fulfillmentData.map((entry, index) => (
//                             <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
//                           ))}
//                         </Pie>
//                         <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0 }} />
//                         <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <p className="text-xs py-16 text-center" style={{ color: tokens.muted }}>No orders in this period</p>
//                   )}
//                 </div>

//                 {/* Signups chart */}
//                 <div className="p-6" style={{ backgroundColor: tokens.surfaceLowest, boxShadow: "0 6px 20px rgba(27,28,26,0.04)" }}>
//                   <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-6" style={{ color: tokens.primary }}>
//                     New Signups
//                   </p>
//                   {signupsData.length > 0 ? (
//                     <ResponsiveContainer width="100%" height={260}>
//                       <BarChart data={signupsData}>
//                         <CartesianGrid strokeDasharray="3 3" stroke={tokens.surfaceHighest} vertical={false} />
//                         <XAxis dataKey="date" tick={{ fontSize: 11, fill: tokens.secondary }} axisLine={{ stroke: tokens.surfaceHighest }} tickLine={false} />
//                         <YAxis tick={{ fontSize: 11, fill: tokens.secondary }} allowDecimals={false} axisLine={false} tickLine={false} />
//                         <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0 }} />
//                         <Bar dataKey="signups" fill={tokens.primary} radius={[3, 3, 0, 0]} />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <p className="text-xs py-16 text-center" style={{ color: tokens.muted }}>No new signups in this period</p>
//                   )}
//                 </div>
//               </div>

//               {/* Top products */}
//               <div className="p-6" style={{ backgroundColor: tokens.surfaceLowest, boxShadow: "0 6px 20px rgba(27,28,26,0.04)" }}>
//                 <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-6" style={{ color: tokens.primary }}>
//                   Top Selling Products
//                 </p>
//                 {(data?.topProducts || []).length > 0 ? (
//                   <div className="flex flex-col gap-1">
//                     {data.topProducts.map((p, idx) => {
//                       const maxSold = data.topProducts[0].totalSold;
//                       const barWidth = (p.totalSold / maxSold) * 100;
//                       return (
//                         <div key={idx} className="py-3" style={{ borderBottom: idx < data.topProducts.length - 1 ? `1px solid ${tokens.surfaceHighest}` : "none" }}>
//                           <div className="flex items-center justify-between mb-2">
//                             <div className="flex items-center gap-3">
//                               <span className="text-xs font-bold w-5" style={{ color: tokens.primary }}>#{idx + 1}</span>
//                               <p className="text-sm truncate max-w-xs" style={{ color: tokens.onSurface }} title={p._id}>{p._id}</p>
//                             </div>
//                             <div className="text-right flex-shrink-0">
//                               <p className="text-xs font-medium" style={{ color: tokens.onSurface }}>{p.totalSold} sold</p>
//                               <p className="text-[10px]" style={{ color: tokens.muted }}>{formatCurrency(p.revenue)}</p>
//                             </div>
//                           </div>
//                           <div className="h-1" style={{ backgroundColor: tokens.surfaceHighest }}>
//                             <div className="h-full transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: tokens.primary }} />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <p className="text-xs py-8 text-center" style={{ color: tokens.muted }}>No sales data yet.</p>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default AdminAnalytics;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../hook/useAdmin";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

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

const PIE_COLORS = ["#C9A96E", "#2563eb", "#7c3aed", "#2e7d32", "#c0392b"];
const RANGE_OPTIONS = [
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
  { label: "90 Days", value: "90" },
];

const TrendBadge = ({ change }) => {
  const isPositive = change >= 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 flex-shrink-0"
      style={{
        color: isPositive ? "#2e7d32" : "#c0392b",
        backgroundColor: isPositive ? "#eaf6ea" : "#fdf0ee",
      }}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: isPositive ? "none" : "rotate(180deg)" }}
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      {Math.abs(change)}%
    </span>
  );
};

const StatCard = ({ label, value, change, sparkData, sparkKey }) => (
  <div
    className="p-4 sm:p-6"
    style={{
      backgroundColor: tokens.surfaceLowest,
      boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
    }}
  >
    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
      <p
        className="text-[8px] sm:text-[9px] uppercase tracking-wider truncate"
        style={{ color: tokens.muted }}
      >
        {label}
      </p>
      {change !== undefined && <TrendBadge change={change} />}
    </div>
    <p
      className="text-xl sm:text-2xl font-light mb-2 sm:mb-3 truncate"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        color: tokens.onSurface,
      }}
    >
      {value}
    </p>
    {sparkData && sparkData.length > 1 && (
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={sparkData}>
          <Line
            type="monotone"
            dataKey={sparkKey}
            stroke={tokens.primary}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )}
  </div>
);

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { handleGetAnalytics } = useAdmin();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const result = await handleGetAnalytics(range);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [range]);

  const formatCurrency = (amount) =>
    `INR ${Number(amount).toLocaleString("en-IN")}`;

  const formatDateShort = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center"
        style={{ backgroundColor: tokens.surface }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: tokens.surfaceHighest,
            borderTopColor: tokens.primary,
          }}
        />
        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: tokens.muted }}
        >
          Crunching the numbers...
        </p>
      </div>
    );
  }

  const revenueData = (data?.revenueByDay || []).map((d) => ({
    date: formatDateShort(d._id),
    revenue: d.revenue,
    orders: d.orders,
  }));
  const signupsData = (data?.signupsByDay || []).map((d) => ({
    date: formatDateShort(d._id),
    signups: d.count,
  }));
  const fulfillmentData = (data?.ordersByFulfillment || []).map((d) => ({
    name: d._id || "unknown",
    value: d.count,
  }));

  const hasAnyData = revenueData.length > 0 || signupsData.length > 0;

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

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4 sm:gap-4 mb-6 sm:mb-10">
            <div>
              <h1
                className="font-light mb-1.5 sm:mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.75rem, 5vw, 3rem)",
                  color: tokens.onSurface,
                }}
              >
                Analytics
              </h1>
              <p
                className="text-xs sm:text-sm"
                style={{ color: tokens.secondary }}
              >
                Performance overview and business insights
              </p>
            </div>

            <div
              className="flex gap-1 p-1 self-start sm:self-auto"
              style={{ backgroundColor: tokens.surfaceLow }}
            >
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRange(opt.value)}
                  className="px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] uppercase tracking-wider font-medium cursor-pointer transition-all duration-200 whitespace-nowrap"
                  style={{
                    backgroundColor:
                      range === opt.value ? tokens.onSurface : "transparent",
                    color:
                      range === opt.value ? tokens.surface : tokens.secondary,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {!hasAnyData ? (
            <div className="py-16 sm:py-24 text-center px-4">
              <p
                className="text-base sm:text-lg mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: tokens.onSurface,
                }}
              >
                No data yet for this period
              </p>
              <p
                className="text-xs sm:text-sm"
                style={{ color: tokens.secondary }}
              >
                Analytics will appear here as orders and signups come in.
              </p>
            </div>
          ) : (
            <>
              {/* KPI cards with sparklines and trend badges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
                <StatCard
                  label={`Revenue (${range}d)`}
                  value={formatCurrency(data.revenue.current)}
                  change={data.revenue.change}
                  sparkData={revenueData}
                  sparkKey="revenue"
                />
                <StatCard
                  label={`Orders (${range}d)`}
                  value={data.orders.current}
                  change={data.orders.change}
                  sparkData={revenueData}
                  sparkKey="orders"
                />
                <StatCard
                  label="Avg. Order Value"
                  value={formatCurrency(data.avgOrderValue)}
                />
                <StatCard
                  label={`New Signups (${range}d)`}
                  value={data.signups.current}
                  change={data.signups.change}
                  sparkData={signupsData}
                  sparkKey="signups"
                />
              </div>

              {/* Revenue trend - large area chart */}
              <div
                className="p-4 sm:p-6 mb-6 sm:mb-8"
                style={{
                  backgroundColor: tokens.surfaceLowest,
                  boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                  <p
                    className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium"
                    style={{ color: tokens.primary }}
                  >
                    Revenue Trend
                  </p>
                  <p
                    className="text-[11px] sm:text-xs"
                    style={{ color: tokens.muted }}
                  >
                    {formatCurrency(data.revenue.current)} total
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
                  <AreaChart
                    data={revenueData}
                    margin={{
                      left: isMobile ? -20 : 0,
                      right: 8,
                      top: 4,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={tokens.primary}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor={tokens.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={tokens.surfaceHighest}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: isMobile ? 9 : 11,
                        fill: tokens.secondary,
                      }}
                      axisLine={{ stroke: tokens.surfaceHighest }}
                      tickLine={false}
                      interval={isMobile ? "preserveStartEnd" : 0}
                      minTickGap={isMobile ? 20 : 5}
                    />
                    <YAxis
                      tick={{
                        fontSize: isMobile ? 9 : 11,
                        fill: tokens.secondary,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={isMobile ? 40 : 60}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name === "revenue" ? "Revenue" : "Orders",
                      ]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 0,
                        border: `1px solid ${tokens.surfaceHighest}`,
                        backgroundColor: tokens.surfaceLowest,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={tokens.primary}
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      dot={{ r: isMobile ? 2 : 3, fill: tokens.primary }}
                      activeDot={{ r: isMobile ? 4 : 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                {/* Fulfillment breakdown */}
                <div
                  className="p-4 sm:p-6"
                  style={{
                    backgroundColor: tokens.surfaceLowest,
                    boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
                  }}
                >
                  <p
                    className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium mb-4 sm:mb-6"
                    style={{ color: tokens.primary }}
                  >
                    Orders by Fulfillment Stage
                  </p>
                  {fulfillmentData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height={isMobile ? 220 : 260}
                    >
                      <PieChart>
                        <Pie
                          data={fulfillmentData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 45 : 55}
                          outerRadius={isMobile ? 68 : 85}
                          paddingAngle={2}
                        >
                          {fulfillmentData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 0 }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: isMobile ? 9 : 11 }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p
                      className="text-xs py-16 text-center"
                      style={{ color: tokens.muted }}
                    >
                      No orders in this period
                    </p>
                  )}
                </div>

                {/* Signups chart */}
                <div
                  className="p-4 sm:p-6"
                  style={{
                    backgroundColor: tokens.surfaceLowest,
                    boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
                  }}
                >
                  <p
                    className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium mb-4 sm:mb-6"
                    style={{ color: tokens.primary }}
                  >
                    New Signups
                  </p>
                  {signupsData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height={isMobile ? 220 : 260}
                    >
                      <BarChart
                        data={signupsData}
                        margin={{
                          left: isMobile ? -20 : 0,
                          right: 8,
                          top: 4,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={tokens.surfaceHighest}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{
                            fontSize: isMobile ? 9 : 11,
                            fill: tokens.secondary,
                          }}
                          axisLine={{ stroke: tokens.surfaceHighest }}
                          tickLine={false}
                          interval={isMobile ? "preserveStartEnd" : 0}
                          minTickGap={isMobile ? 20 : 5}
                        />
                        <YAxis
                          tick={{
                            fontSize: isMobile ? 9 : 11,
                            fill: tokens.secondary,
                          }}
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          width={isMobile ? 30 : 40}
                        />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 0 }}
                        />
                        <Bar
                          dataKey="signups"
                          fill={tokens.primary}
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p
                      className="text-xs py-16 text-center"
                      style={{ color: tokens.muted }}
                    >
                      No new signups in this period
                    </p>
                  )}
                </div>
              </div>

              {/* Top products */}
              <div
                className="p-4 sm:p-6"
                style={{
                  backgroundColor: tokens.surfaceLowest,
                  boxShadow: "0 6px 20px rgba(27,28,26,0.04)",
                }}
              >
                <p
                  className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium mb-4 sm:mb-6"
                  style={{ color: tokens.primary }}
                >
                  Top Selling Products
                </p>
                {(data?.topProducts || []).length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {data.topProducts.map((p, idx) => {
                      const maxSold = data.topProducts[0].totalSold;
                      const barWidth = (p.totalSold / maxSold) * 100;
                      return (
                        <div
                          key={idx}
                          className="py-3"
                          style={{
                            borderBottom:
                              idx < data.topProducts.length - 1
                                ? `1px solid ${tokens.surfaceHighest}`
                                : "none",
                          }}
                        >
                          <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <span
                                className="text-xs font-bold w-4 sm:w-5 flex-shrink-0"
                                style={{ color: tokens.primary }}
                              >
                                #{idx + 1}
                              </span>
                              <p
                                className="text-xs sm:text-sm truncate max-w-[140px] sm:max-w-xs"
                                style={{ color: tokens.onSurface }}
                                title={p._id}
                              >
                                {p._id}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p
                                className="text-[11px] sm:text-xs font-medium whitespace-nowrap"
                                style={{ color: tokens.onSurface }}
                              >
                                {p.totalSold} sold
                              </p>
                              <p
                                className="text-[9px] sm:text-[10px] whitespace-nowrap"
                                style={{ color: tokens.muted }}
                              >
                                {formatCurrency(p.revenue)}
                              </p>
                            </div>
                          </div>
                          <div
                            className="h-1"
                            style={{ backgroundColor: tokens.surfaceHighest }}
                          >
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: tokens.primary,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    className="text-xs py-8 text-center"
                    style={{ color: tokens.muted }}
                  >
                    No sales data yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;