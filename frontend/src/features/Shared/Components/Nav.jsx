import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../auth/hook/useAuth.js";
import HelpPanel from "../../help/components/HelpPanel.jsx";

const Nav = () => {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart?.items);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  const menuItems = [
    {
      label: "Home",
      path: "/",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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
      label: "Profile",
      path: "/profile",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      ),
    },
    {
      label: "Products",
      path: "/products",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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
      label: "Your Orders",
      path: "/orders",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.5 7.5 12 3 3.5 7.5v9L12 21l8.5-4.5v-9z" />
          <path d="M3.5 7.5 12 12l8.5-4.5" />
          <path d="M12 12v9" />
        </svg>
      ),
    },
    {
      label: "Favourites",
      path: "/favourites",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      ),
    },
    {
      label: "Help",
      action: () => {
        setShowDrawer(false);
        setShowHelpPanel(true);
      },
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];
  if (user?.role === "admin") {
    menuItems.push({
      label: "Users Orders",
      path: "/admin/orders",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <path d="M8 4v5" />
        </svg>
      ),
    });

    menuItems.push({
      label: "Analytics",
      path: "/admin/analytics",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M18 9l-5 5-3-3-4 4" />
        </svg>
      ),
    });
    menuItems.push({
      label: "Support Inbox",
      path: "/admin/support",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    });
  }

  return (
    <>
      <nav className="border-b bg-[#fbf9f6]" style={{ borderColor: "#e4e2df" }}>
        <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pt-10 pb-6 flex items-center justify-between">
          <Link
            to={user?.role === "seller" ? "/seller/dashboard" : "/"}
            className="text-sm font-medium tracking-[0.35em] uppercase hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#C9A96E",
            }}
          >
            Snitch.
          </Link>
          <div
            className="flex gap-6 items-center text-[10px] uppercase tracking-[0.2em] font-medium"
            style={{ color: "#7A6E63" }}
          >
            {user ? (
              <>
                {user.role === "seller" ? (
                  <div className="flex items-center gap-6">
                    <Link
                      to="/seller/dashboard"
                      className="transition-colors hover:text-[#C9A96E] uppercase"
                    >
                      Seller Dashboard
                    </Link>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="transition-colors hover:text-[#C9A96E] cursor-pointer uppercase"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/cart"
                      className="relative flex items-center hover:opacity-70 transition-opacity"
                      style={{ color: "#1b1c1a" }}
                      aria-label="Shopping cart"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      {cartItems?.length > 0 && (
                        <span
                          className="absolute -top-2 -right-2 flex items-center justify-center rounded-full text-white"
                          style={{
                            backgroundColor: "#C9A96E",
                            width: "16px",
                            height: "16px",
                            fontSize: "9px",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            letterSpacing: 0,
                          }}
                        >
                          {cartItems.length > 9 ? "9+" : cartItems.length}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={() => setShowDrawer(true)}
                      className="flex items-center hover:opacity-70 transition-opacity cursor-pointer"
                      style={{ color: "#1b1c1a" }}
                      aria-label="Account menu"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="transition-colors hover:text-[#C9A96E]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="transition-colors hover:text-[#C9A96E]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Right-side Account Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(27, 28, 26, 0.4)" }}
            onClick={() => setShowDrawer(false)}
          />
          {/* Panel */}
          <div
            className="absolute top-0 right-0 h-full w-full max-w-sm flex flex-col animate-slide-in-right"
            style={{
              backgroundColor: "#fbf9f6",
              boxShadow: "-10px 0 40px rgba(27,28,26,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 pt-10 pb-6 border-b"
              style={{ borderColor: "#e4e2df" }}
            >
              <div>
                <p
                  className="text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: "#B5ADA3" }}
                >
                  Signed in as
                </p>
                <p
                  className="text-sm font-medium mt-1"
                  style={{ color: "#1b1c1a" }}
                >
                  {user?.fullName}
                </p>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="cursor-pointer"
                style={{ color: "#7A6E63" }}
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu items */}
            <div className="flex-1 px-4 py-6">
              {menuItems.map((item) =>
                item.action ? (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 px-4 py-4 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors hover:bg-[#f5f3f0] cursor-pointer text-left"
                    style={{ color: "#1b1c1a" }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowDrawer(false)}
                    className="flex items-center gap-4 px-4 py-4 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors hover:bg-[#f5f3f0]"
                    style={{ color: "#1b1c1a" }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ),
              )}
            </div>

            {/* Logout — pinned at bottom, brand-styled, centered text */}
            <div
              className="px-6 pb-8 pt-4 border-t"
              style={{ borderColor: "#e4e2df" }}
            >
              <button
                onClick={() => {
                  setShowDrawer(false);
                  setShowLogoutModal(true);
                }}
                className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-all duration-300"
                style={{
                  backgroundColor: "#1b1c1a",
                  color: "#fbf9f6",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C9A96E";
                  e.currentTarget.style.color = "#1b1c1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1b1c1a";
                  e.currentTarget.style.color = "#fbf9f6";
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(27, 28, 26, 0.4)" }}
        >
          <div
            className="w-full max-w-xs p-8 text-center animate-fade-in-scale"
            style={{
              backgroundColor: "#fbf9f6",
              border: "1px solid #e4e2df",
              boxShadow: "0 20px 40px rgba(27,28,26,0.08)",
            }}
          >
            <h3
              className="font-light text-2xl mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#1b1c1a",
              }}
            >
              Confirm Logout
            </h3>
            <p
              className="text-[9px] uppercase tracking-[0.15em] mb-8"
              style={{ color: "#7A6E63" }}
            >
              Are you sure you want to exit?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-300 border cursor-pointer"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#d0c5b5",
                  color: "#7A6E63",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#7A6E63")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#d0c5b5")
                }
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutModal(false);
                  await handleLogout();
                  navigate("/login");
                }}
                className="flex-1 py-3 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: "#1b1c1a",
                  color: "#fbf9f6",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#C9A96E")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1b1c1a")
                }
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
      <HelpPanel
        isOpen={showHelpPanel}
        onClose={() => setShowHelpPanel(false)}
      />
    </>
  );
};

export default Nav;
