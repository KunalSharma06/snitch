import express from 'express';
import { authenticateSeller } from '../middlewares/auth.middleware.js';
import { addProductVariant, createProduct, getAllProducts, getProductDetail, getSimilarProducts, getSellerProducts, updateVariantStock, updateProduct, updateVariant, deleteProduct, deleteVariant} from '../controllers/product.controller.js';
import multer from 'multer';
import { createProductValidator } from '../validators/product.validator.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

const productRouter = express.Router();

productRouter.post("/create", authenticateSeller, upload.array('images', 7), createProductValidator, createProduct)
productRouter.get("/seller", authenticateSeller, getSellerProducts);
productRouter.get("/all", getAllProducts);
productRouter.get("/detail/:id", getProductDetail);
productRouter.get("/:id/similar", getSimilarProducts);
productRouter.post("/:productId/variants", authenticateSeller, upload.array('images', 7), addProductVariant);
productRouter.put("/:productId/variants/:variantId/stock", authenticateSeller, updateVariantStock);
productRouter.patch("/:productId/variants/:variantId", authenticateSeller, updateVariant);
productRouter.patch("/:productId", authenticateSeller, updateProduct);
productRouter.delete("/:productId", authenticateSeller, deleteProduct);
productRouter.delete("/:productId/variants/:variantId", authenticateSeller, deleteVariant);


export default productRouter;