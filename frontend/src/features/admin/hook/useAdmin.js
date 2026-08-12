import { getAllOrdersApi, getAdminStatsApi, updateFulfillmentStatusApi, getAnalyticsApi} from "../../cart/service/cart.api.js";

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

  return { handleGetAllOrders, handleUpdateFulfillmentStatus, handleGetAdminStats, handleGetAnalytics };
};