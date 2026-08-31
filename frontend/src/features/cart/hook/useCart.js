import {
  addItem,
  getCart,
  incrementCartItemApi,
  decrementCartItemApi,
  removeItemApi,
  createOrderApi,
  verifyCartOrderApi,
  getUserOrdersApi,
  cancelOrderApi,
} from "../service/cart.api.js";
import { useDispatch } from "react-redux";
import { setCart, incrementCartItem, removeItem } from "../state/cart.slice.js";

export const useCart = () => {
  const dispatch = useDispatch();

  async function handleAddItem({ productId, variantId }) {
    const data = await addItem({ productId, variantId });
    if (data?.cart?.items) {
      dispatch(setCart(data.cart));
    } else {
      await handleGetCart();
    }
    return data;
  }

  async function handleGetCart() {
    const data = await getCart();
    dispatch(setCart(data.cart));
  }

  async function handleIncrementCartItem({ productId, variantId }) {
    const data = await incrementCartItemApi({ productId, variantId });
    if (data?.cart?.items) {
      dispatch(setCart(data.cart));
    }
    return data;
  }

  async function handleDecrementCartItem({ productId, variantId }) {
    const data = await decrementCartItemApi({ productId, variantId });
    if (data?.cart?.items) {
      dispatch(setCart(data.cart));
    }
    return data;
  }

  async function handleRemoveItem({ productId, variantId }) {
    const data = await removeItemApi({ productId, variantId });
    if (data?.cart) {
      dispatch(setCart(data.cart));
    } else {
      dispatch(removeItem({ productId, variantId }));
    }
    return data;
  }

  async function handleCreateCartOrder(addressId, paymentMethod) {
    const data = await createOrderApi(addressId, paymentMethod);
    if (paymentMethod === "cod") {
      return data;
    }
    return data.order;
  }

  async function handleVerifyCartOrder({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) {
    const data = await verifyCartOrderApi({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return data.success;
  }

  async function handleGetUserOrders() {
    const data = await getUserOrdersApi();
    return data.orders;
  }

  async function handleCancelOrder(orderId) {
    const data = await cancelOrderApi(orderId);
    return data;
  }

  return {
    handleAddItem,
    handleGetCart,
    handleIncrementCartItem,
    handleDecrementCartItem,
    handleRemoveItem,
    handleCreateCartOrder,
    handleVerifyCartOrder,
    handleGetUserOrders,
    handleCancelOrder,
  };
};
