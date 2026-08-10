import { createSlice } from "@reduxjs/toolkit";

const favouriteSlice = createSlice({
  name: "favourites",
  initialState: {
    productIds: [], // array of favourited product IDs
  },
  reducers: {
    setFavouriteIds: (state, action) => {
      state.productIds = action.payload;
    },
    addFavouriteId: (state, action) => {
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload);
      }
    },
    removeFavouriteId: (state, action) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
    },
  },
});

export const { setFavouriteIds, addFavouriteId, removeFavouriteId } =
  favouriteSlice.actions;
export default favouriteSlice.reducer;
