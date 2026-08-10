import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate favourites for the same user+product
favouriteSchema.index({ user: 1, product: 1 }, { unique: true });

const favouriteModel = mongoose.model("favourite", favouriteSchema);
export default favouriteModel;
