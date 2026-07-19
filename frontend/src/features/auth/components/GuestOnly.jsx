import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';

const GuestOnly = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6]">
        <div className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">
          Loading...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestOnly;
