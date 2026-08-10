import axios from "axios";

const favouriteApiInstance = axios.create({
  baseURL: "/api/favourites",
  withCredentials: true,
});

export const getFavourites = async () => {
  const res = await favouriteApiInstance.get("/");
  return res.data;
};

export const getFavouriteIds = async () => {
  const res = await favouriteApiInstance.get("/ids");
  return res.data;
};

export const addFavourite = async (productId) => {
  const res = await favouriteApiInstance.post(`/${productId}`);
  return res.data;
};

export const removeFavourite = async (productId) => {
  const res = await favouriteApiInstance.delete(`/${productId}`);
  return res.data;
};
