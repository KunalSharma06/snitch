import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth.js'

const Nav = () => {
    const navigate = useNavigate()
    const { handleLogout } = useAuth()
    const user = useSelector(state => state.auth.user)
    const cartItems = useSelector(state => state.cart?.items)

    const [showLogoutModal, setShowLogoutModal] = useState(false)

    return (
        <>
            <nav className="border-b bg-[#fbf9f6]" style={{ borderColor: '#e4e2df' }}>
                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pt-10 pb-6 flex items-center justify-between">
                    <Link to={user?.role === 'seller' ? "/seller/dashboard" : "/"}
                        className="text-sm font-medium tracking-[0.35em] uppercase hover:opacity-80 transition-opacity"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
                    >
                        Snitch.
                    </Link>
                    <div className="flex gap-6 items-center text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#7A6E63' }}>
                        {user ? (
                            <>
                                <span style={{ color: '#1b1c1a' }}>{user.fullName}</span>
                                {user.role === 'seller' && (
                                    <Link to="/seller/dashboard" className="transition-colors hover:text-[#C9A96E]">Seller Dashboard</Link>
                                )}
                                {user.role !== 'seller' && (
                                    <Link
                                        to="/cart"
                                        className="relative flex items-center hover:opacity-70 transition-opacity"
                                        style={{ color: '#1b1c1a' }}
                                        aria-label="Shopping cart"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                        {cartItems?.length > 0 && (
                                            <span
                                                className="absolute -top-2 -right-2 flex items-center justify-center rounded-full text-white"
                                                style={{
                                                    backgroundColor: '#C9A96E',
                                                    width: '16px',
                                                    height: '16px',
                                                    fontSize: '9px',
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontWeight: 600,
                                                    letterSpacing: 0,
                                                }}
                                            >
                                                {cartItems.length > 9 ? '9+' : cartItems.length}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="transition-colors
                                    text-[11px] font-medium hover:text-red-500 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="transition-colors hover:text-[#C9A96E]">Sign In</Link>
                                <Link to="/register" className="transition-colors hover:text-[#C9A96E]">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(27, 28, 26, 0.4)' }}
                >
                    <div 
                        className="w-full max-w-xs p-8 text-center animate-fade-in-scale"
                        style={{ 
                            backgroundColor: '#fbf9f6', 
                            border: '1px solid #e4e2df',
                            boxShadow: '0 20px 40px rgba(27,28,26,0.08)'
                        }}
                    >
                        <h3 
                            className="font-light text-2xl mb-2"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Confirm Logout
                        </h3>
                        <p 
                            className="text-[9px] uppercase tracking-[0.15em] mb-8"
                            style={{ color: '#7A6E63' }}
                        >
                            Are you sure you want to exit?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-300 border cursor-pointer"
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    borderColor: '#d0c5b5',
                                    color: '#7A6E63' 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7A6E63'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d0c5b5'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setShowLogoutModal(false)
                                    await handleLogout()
                                    navigate("/login")
                                }}
                                className="flex-1 py-3 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-300 cursor-pointer"
                                style={{ 
                                    backgroundColor: '#1b1c1a', 
                                    color: '#fbf9f6' 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C9A96E'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1b1c1a'}
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
            `}</style>
        </>
    )
}

export default Nav