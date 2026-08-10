import { useDispatch, useSelector } from "react-redux";
import {
  getFavourites,
  getFavouriteIds,
  addFavourite,
  removeFavourite,
} from "../services/favourite.api.js";
import {
  setFavouriteIds,
  addFavouriteId,
  removeFavouriteId,
} from "../state/favourite.slice.js";

export const useFavourites = () => {
  const dispatch = useDispatch();
  const favouriteIds = useSelector((state) => state.favourites.productIds);

  async function handleGetFavourites() {
    const data = await getFavourites();
    return data.favourites;
  }

  async function handleLoadFavouriteIds() {
    const data = await getFavouriteIds();
    dispatch(setFavouriteIds(data.productIds));
  }

  async function handleToggleFavourite(productId) {
    const isFav = favouriteIds.includes(productId);
    if (isFav) {
      await removeFavourite(productId);
      dispatch(removeFavouriteId(productId));
    } else {
      await addFavourite(productId);
      dispatch(addFavouriteId(productId));
    }
    return !isFav;
  }

  function isFavourite(productId) {
    return favouriteIds.includes(productId);
  }

  return {
    favouriteIds,
    handleGetFavourites,
    handleLoadFavouriteIds,
    handleToggleFavourite,
    isFavourite,
  };
};
