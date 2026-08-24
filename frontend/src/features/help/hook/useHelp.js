import {
  getConversation,
  sendMessageApi,
  getAllConversationsApi,
  getConversationMessagesApi,
  sendAgentReplyApi,
  closeConversationApi,
  closeConversationByTimeoutApi,
  deleteConversationApi
} from "../service/help.api.js";

export const useHelp = () => {
  async function handleGetConversation() {
    const data = await getConversation();
    return data;
  }

  async function handleSendMessage(text) {
    const data = await sendMessageApi(text);
    return data;
  }

  async function handleGetAllConversations() {
    const data = await getAllConversationsApi();
    return data.conversations;
  }

  async function handleGetConversationMessages(conversationId) {
    const data = await getConversationMessagesApi(conversationId);
    return data.messages;
  }

  async function handleSendAgentReply(conversationId, text) {
    const data = await sendAgentReplyApi(conversationId, text);
    return data.message;
  }

  async function handleCloseConversation(conversationId) {
    const data = await closeConversationApi(conversationId);
    return data;
  }

  async function handleCloseByTimeout(conversationId) {
    const data = await closeConversationByTimeoutApi(conversationId);
    return data;
  }

  async function handleDeleteConversation(conversationId) {
    const data = await deleteConversationApi(conversationId);
    return data;
  }

  return {
    handleGetConversation,
    handleSendMessage,
    handleGetAllConversations,
    handleGetConversationMessages,
    handleSendAgentReply,
    handleCloseConversation,
    handleCloseByTimeout,
    handleDeleteConversation
  };
};