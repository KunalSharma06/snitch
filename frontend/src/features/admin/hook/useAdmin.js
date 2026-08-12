import { getAllOrdersApi, getAdminStatsApi, updateFulfillmentStatusApi } from "../../cart/service/cart.api.js";

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

  return { handleGetAllOrders, handleUpdateFulfillmentStatus, handleGetAdminStats };
};