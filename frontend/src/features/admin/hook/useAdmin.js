import { getAllOrdersApi, getAdminStatsApi, updateFulfillmentStatusApi, getAnalyticsApi, adminCancelOrderApi } from "../../cart/service/cart.api.js";

export const useAdmin = () => {
  async function handleGetAllOrders(params) {
    const data = await getAllOrdersApi(params);
    return data;
  }

  async function handleGetAdminStats() {
    const data = await getAdminStatsApi();
    return data;
  }

  async function handleUpdateFulfillmentStatus(orderId, fulfillmentStatus) {
    const data = await updateFulfillmentStatusApi(orderId, fulfillmentStatus);
    return data;
  }

  async function handleGetAnalytics(range) {
    const data = await getAnalyticsApi(range);
    return data;
  }

  async function handleAdminCancelOrder(orderId, reason) {
    const data = await adminCancelOrderApi(orderId, reason);
    return data;
  }

  return { handleGetAllOrders, handleUpdateFulfillmentStatus, handleGetAdminStats, handleGetAnalytics, handleAdminCancelOrder };
};