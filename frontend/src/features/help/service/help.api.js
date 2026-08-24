import axios from "axios";

const helpApiInstance = axios.create({
  baseURL: "/api/help",
  withCredentials: true,
});

export const getConversation = async () => {
  const res = await helpApiInstance.get("/conversation");
  return res.data;
};

export const sendMessageApi = async (text) => {
  const res = await helpApiInstance.post("/conversation/message", { text });
  return res.data;
};

export const getAllConversationsApi = async () => {
  const res = await helpApiInstance.get("/admin/conversations");
  return res.data;
};

export const getConversationMessagesApi = async (conversationId) => {
  const res = await helpApiInstance.get(`/admin/conversations/${conversationId}/messages`);
  return res.data;
};

export const sendAgentReplyApi = async (conversationId, text) => {
  const res = await helpApiInstance.post(`/admin/conversations/${conversationId}/reply`, { text });
  return res.data;
};

export const closeConversationApi = async (conversationId) => {
  const res = await helpApiInstance.patch(`/admin/conversations/${conversationId}/close`);
  return res.data;
};

export const closeConversationByTimeoutApi = async (conversationId) => {
  const res = await helpApiInstance.patch(`/conversation/${conversationId}/timeout-close`);
  return res.data;
};

export async function deleteConversationApi(conversationId) {
  const res = await helpApiInstance.delete(`/admin/conversation/${conversationId}`);
  return res.data;
}