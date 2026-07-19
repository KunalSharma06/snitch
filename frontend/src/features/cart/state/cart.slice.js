import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    incrementCartItem: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: item.quantity + 1 }
        } else {
          return item;
        }
      })
    },
    removeItem: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(item => {
        const itemProduct = item.product?._id || item.product?.toString() || item.product;
        const itemVariant = item.variant?._id || item.variant?.toString() || item.variant;
        return !(itemProduct === productId && itemVariant === variantId);
      });
    },
  },
});

export const { setItems, addItem, incrementCartItem, removeItem } = cartSlice.actions;
export default cartSlice.reducer;
