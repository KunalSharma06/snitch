import { Router } from "express";
import {
  getConversation,
  sendMessage,
  getAllConversations,
  getConversationMessages,
  sendAgentReply,
  closeConversation,
  closeConversationByTimeout,
  deleteConversation
} from "../controllers/help.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const helpRouter = Router();

helpRouter.get("/conversation", authenticateUser, getConversation);
helpRouter.post("/conversation/message", authenticateUser, sendMessage);

helpRouter.delete("/admin/conversation/:conversationId", authenticateAdmin, deleteConversation);

helpRouter.get("/admin/conversations", authenticateAdmin, getAllConversations);
helpRouter.get("/admin/conversations/:conversationId/messages", authenticateAdmin, getConversationMessages);
helpRouter.post("/admin/conversations/:conversationId/reply", authenticateAdmin, sendAgentReply);
helpRouter.patch("/admin/conversations/:conversationId/close", authenticateAdmin, closeConversation);
helpRouter.patch("/conversation/:conversationId/timeout-close", authenticateUser, closeConversationByTimeout);

export default helpRouter;