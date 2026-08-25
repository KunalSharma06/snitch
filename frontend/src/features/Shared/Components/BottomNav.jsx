import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router";

const tokens = {
  surface: "#fbf9f6",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  secondary: "#7A6E63",
  primary: "#C9A96E",
};

const BottomNav = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart?.items);

  if (user?.role === "seller" || user?.role === "admin") return null;

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: (active) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      ),
    },
    {
      label: "Shop",
      path: "/products",
      icon: (active) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: "Cart",
      path: "/cart",
      badge:
        cartItems?.length > 0
          ? cartItems.length > 9
            ? "9+"
            : cartItems.length
          : null,
      icon: (active) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Favourites",
      path: "/favourites",
      icon: (active) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      ),
    },
    {
      label: "Profile",
      path: user ? "/profile" : "/login",
      icon: (active) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t"
      style={{
        backgroundColor: tokens.surface,
        borderColor: tokens.surfaceHighest,
        zIndex: 40,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center justify-center gap-1 py-2.5 flex-1"
            style={{ color: active ? tokens.onSurface : tokens.secondary }}
          >
            {item.icon(active)}
            {item.badge && (
              <span
                className="absolute top-1 right-1/4 flex items-center justify-center rounded-full text-white"
                style={{
                  backgroundColor: tokens.primary,
                  width: "15px",
                  height: "15px",
                  fontSize: "8px",
                  fontWeight: 600,
                }}
              >
                {item.badge}
              </span>
            )}
            <span className="text-[9px] uppercase tracking-wider font-medium">
              {item.label}
            </span>
            {active && (
              <span
                className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px]"
                style={{ backgroundColor: tokens.primary }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
