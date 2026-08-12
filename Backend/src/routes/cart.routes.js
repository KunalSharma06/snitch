import express from 'express';
import { authenticateUser, authenticateAdmin } from '../middlewares/auth.middleware.js';
import { validateAddToCart, validateIncrementCartItemQuantity, validateDecrementCartItemQuantity} from '../validators/cart.validator.js';
import {
  addToCart,
  getCart,
  incrementCartItemQuantity,
  decrementCartItemQuantity,
  removeFromCart,
  createOrderController,
  verifyOrderController,
  getUserOrders,
  cancelOrder,
  getAllOrders,
  getAdminOrderStats,
  updateFulfillmentStatus,
  getAnalytics
} from "../controllers/cart.controller.js";

const cartRouter = express.Router();


cartRouter.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCart)
cartRouter.get("/", authenticateUser, getCart);
cartRouter.patch("/quantity/increment/:productId/:variantId", authenticateUser, validateIncrementCartItemQuantity, incrementCartItemQuantity);
cartRouter.patch("/quantity/decrement/:productId/:variantId", authenticateUser, validateDecrementCartItemQuantity, decrementCartItemQuantity);
cartRouter.delete("/remove/:productId/:variantId", authenticateUser, removeFromCart);
cartRouter.post("/payment/create/order", authenticateUser, createOrderController);
cartRouter.post("/payment/verify/order", authenticateUser, verifyOrderController);
cartRouter.get("/orders", authenticateUser, getUserOrders);
cartRouter.patch("/orders/:orderId/cancel", authenticateUser, cancelOrder);

cartRouter.get("/admin/orders", authenticateAdmin, getAllOrders);
cartRouter.get("/admin/stats", authenticateAdmin, getAdminOrderStats);

cartRouter.patch("/admin/orders/:orderId/fulfillment", authenticateAdmin, updateFulfillmentStatus);

cartRouter.get("/admin/analytics", authenticateAdmin, getAnalytics);
export default cartRouter;