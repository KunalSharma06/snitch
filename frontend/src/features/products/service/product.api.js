import axios from "axios";

const productApiInstance = axios.create({
  baseURL: "/api/products",
  withCredentials: true,
});

export async function createProduct(formData) {
  const res = await productApiInstance.post("/create", formData);
  return res.data;
}

export async function getSellerProduct() {
  const res = await productApiInstance.get("/seller");
  return res.data;
}

export async function getAllProducts() {
  const res = await productApiInstance.get("/all");
  return res.data;
}

export async function getProductDetail(productId) {
  const res = await productApiInstance.get(`/detail/${productId}`);
  return res.data;
}

export async function addProductVariant(productId, newProductVariant) {
  const formData = new FormData;
  newProductVariant.images.forEach((image) => {
    formData.append(`images`, image.file);
  })
  formData.append("stock", newProductVariant.stock);
  formData.append("priceAmount", newProductVariant.price || "");
  formData.append("attributes", JSON.stringify(newProductVariant.attributes));
  const res = await productApiInstance.post(`/${productId}/variants`, formData);

  return res.data;
}

export async function updateVariantStock(productId, variantId, stock) {
  const res = await productApiInstance.put(`/${productId}/variants/${variantId}/stock`, { stock });
  return res.data;
}

export async function updateProduct(productId, { title, description, priceAmount, priceCurrency }) {
  const res = await productApiInstance.patch(`/${productId}`, {
    title,
    description,
    priceAmount,
    priceCurrency,
  });
  return res.data;
}

export async function updateVariantApi(productId, variantId, { priceAmount, priceCurrency, stock, attributes }) {
  const res = await productApiInstance.patch(`/${productId}/variants/${variantId}`, {
    priceAmount,
    priceCurrency,
    stock,
    attributes,
  });
  return res.data;
}