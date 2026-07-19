import { createProduct, getSellerProduct, getAllProducts, getProductDetail, addProductVariant, updateVariantStock, updateProduct, updateVariantApi } from "../service/product.api.js"
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from "../state/product.slice.js";

export const useProduct = () => {

  const dispatch = useDispatch();

  async function handleCreateProduct(formData) {
    const data = await createProduct(formData);
    return data.product;
  }

  async function handleGetSellerProduct() {
    const data = await getSellerProduct();
    dispatch(setSellerProducts(data.products));
    return data.products;
  }

  async function handleGetAllProducts() {
    const data = await getAllProducts();
    dispatch(setProducts(data.products));
  }

  async function handleGetProductById(productId) {
    const data = await getProductDetail(productId);
    return data.product;
  }

  async function handleAddProductVariant(productId, newProductVariant) {
    const data = await addProductVariant(productId, newProductVariant);
    return data;
  }

  async function handleUpdateVariantStock(productId, variantId, stock) {
    const data = await updateVariantStock(productId, variantId, stock);
    return data;
  }

  async function handleUpdateProduct(productId, fields) {
    const data = await updateProduct(productId, fields);
    return data;
  }

  async function handleUpdateVariant(productId, variantId, fields) {
    const data = await updateVariantApi(productId, variantId, fields);
    return data;
  }

  return { handleCreateProduct, handleGetSellerProduct, handleGetAllProducts, handleGetProductById, handleAddProductVariant, handleUpdateVariantStock, handleUpdateProduct, handleUpdateVariant };
}