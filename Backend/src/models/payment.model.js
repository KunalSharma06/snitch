import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const paymentSchema = new mongoose.Schema(
  {
    status: {
    type: String,
    enum: ["pending", "paid", "failed", "cod_pending", "cancelled"],
    default: "pending",
  },
  estimatedDelivery: {
    type: Date,
  },
    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      default: "razorpay",
    },
    fulfillmentStatus: {
    type: String,
    enum: ["processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
    default: "processing",
  },
    address: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },

    price: {
      type: priceSchema,
      required: true,
    },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderItems: [
      {
        title: String,
        productId: mongoose.Schema.Types.ObjectId,
        variantId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        images: [{ url: String }],
        description: String,
        price: priceSchema,
      },
    ],
  },
  { timestamps: true },
);

const paymentModel = mongoose.model("payment", paymentSchema);
export default paymentModel;
