import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "agent"],
      required: true,
    },
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const messageModel = mongoose.model("message", messageSchema);
export default messageModel;
