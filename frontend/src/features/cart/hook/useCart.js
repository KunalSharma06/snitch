import { addItem, getCart, incrementCartItemApi, decrementCartItemApi, removeItemApi, createOrderApi, verifyCartOrderApi } from "../service/cart.api.js";
import { useDispatch } from "react-redux";
import { setCart, incrementCartItem, removeItem } from "../state/cart.slice.js";

export const useCart = () => {
  const dispatch = useDispatch();

  async function handleAddItem({ productId, variantId }) {
    const data = await addItem({ productId, variantId });
    // Update Redux state so the cart badge count updates immediately
    if (data?.cart?.items) {
      dispatch(setCart(data.cart));
    } else {
      // Fallback: push a minimal item so badge increments
      dispatch(addItemToCart({ productId, variantId, quantity: 1 }));
    }
    return data;
  }

  async function handleGetCart() {
    const data = await getCart();
    dispatch(setCart(data.cart))
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
    // Filter locally to preserve populated item details in Redux
    dispatch(removeItem({ productId, variantId }));
    return data;
  }

  async function handleCreateCartOrder() {
    const data = await createOrderApi();
    return data.order;
  }

  async function handleVerifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const data = await verifyCartOrderApi({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    return data.success;
  }

  return { handleAddItem, handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleRemoveItem, handleCreateCartOrder, handleVerifyCartOrder };
}