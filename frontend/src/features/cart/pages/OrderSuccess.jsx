import React from "react";
import { useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fbf9f6]">
      <h1 className="text-4xl font-bold mb-4" style={{ color: '#C9A96E' }}>Order Successful!</h1>
      <p className="text-lg" style={{ color: '#7A6E63' }}>Thank you for your purchase. Your order has been placed successfully.</p>
    </div>
  );
}

export default OrderSuccess;