import { Router } from "express";
import {
  getOrCreateConversation,
  sendMessage,
  getAllConversations,
  getConversationMessages,
  sendAgentReply,
  closeConversation
} from "../controllers/help.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const helpRouter = Router();

helpRouter.get("/conversation", authenticateUser, getOrCreateConversation);
helpRouter.post("/conversation/message", authenticateUser, sendMessage);

helpRouter.get("/admin/conversations", authenticateAdmin, getAllConversations);
helpRouter.get("/admin/conversations/:conversationId/messages", authenticateAdmin, getConversationMessages);
helpRouter.post("/admin/conversations/:conversationId/reply", authenticateAdmin, sendAgentReply);
helpRouter.patch("/admin/conversations/:conversationId/close", authenticateAdmin, closeConversation);

export default helpRouter;