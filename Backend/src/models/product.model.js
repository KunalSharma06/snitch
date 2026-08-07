import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: false,
      trim: true,
      default: "Unbranded",
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    price: {
      type: priceSchema,
      required: true,
    },
    discountedPrice: {
      type: priceSchema,
      required: false,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    variants: [
      {
        images: [
          {
            url: {
              type: String,
              required: true,
            },
          },
        ],
        stock: {
          type: Number,
          default: 0,
        },
        attributes: {
          type: Map,
          of: String,
        },
        price: {
          type: priceSchema,
        },
        discountedPrice: {
          type: priceSchema,
        },
      },
    ],
  },
  { timestamps: true },
);

productSchema.index({ productType: 1 });
productSchema.index({ brand: 1 });

const productModel = mongoose.model('product', productSchema);
export default productModel;