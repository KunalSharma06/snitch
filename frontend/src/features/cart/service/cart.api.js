import axios from "axios";

const cartApiInstance = axios.create({
  baseURL: "/api/cart",
  withCredentials: true,
});

export const addItem = async ({ productId, variantId }) => {
  const res = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
    quantity: 1,
  });
  return res.data;
};

export const getCart = async () => {
  const res = await cartApiInstance.get("/");
  return res.data;
};

export const incrementCartItemApi = async ({ productId, variantId }) => {
  // console.log("incrementCartItemApi called with", { productId, variantId });
  const res = await cartApiInstance.patch(
    `/quantity/increment/${productId}/${variantId}`,
  );
  return res.data;
};

export const removeItemApi = async ({ productId, variantId }) => {
  const res = await cartApiInstance.delete(`/remove/${productId}/${variantId}`);
  return res.data;
};

export const decrementCartItemApi = async ({ productId, variantId }) => {
  const res = await cartApiInstance.patch(
    `/quantity/decrement/${productId}/${variantId}`
  );
  return res.data;
};
