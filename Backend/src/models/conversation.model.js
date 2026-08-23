import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    agentRespondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const conversationModel = mongoose.model("conversation", conversationSchema);
export default conversationModel;
