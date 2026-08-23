import conversationModel from "../models/conversation.model.js";
import messageModel from "../models/message.model.js";

// Get or create the user's active conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    let conversation = await conversationModel
      .findOne({ user: req.user._id, status: "open" })
      .sort({ createdAt: -1 });

    if (!conversation) {
      conversation = await conversationModel.create({ user: req.user._id });
    }

    const messages = await messageModel
      .find({ conversation: conversation._id })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching conversation" });
  }
};

// Send a message (as the user)
export const sendMessage = async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    let conversation = await conversationModel
      .findOne({ user: req.user._id, status: "open" })
      .sort({ createdAt: -1 });

    if (!conversation) {
      conversation = await conversationModel.create({ user: req.user._id });
    }

    const message = await messageModel.create({
      conversation: conversation._id,
      sender: "user",
      senderUser: req.user._id,
      text: text.trim(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const io = req.app.get("io");
    // Notify admins in real-time that a new message arrived
    io.to("admin-support").emit("newSupportMessage", {
      conversationId: conversation._id.toString(),
      message,
      userFullName: req.user.fullName,
      userEmail: req.user.email,
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error sending message" });
  }
};

// Admin: get all conversations
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await conversationModel
      .find({})
      .populate("user", "fullName email")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching conversations" });
  }
};

// Admin: get messages for a specific conversation
export const getConversationMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await messageModel
      .find({ conversation: conversationId })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching messages" });
  }
};

// Admin: reply to a conversation
export const sendAgentReply = async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    const conversation = await conversationModel.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await messageModel.create({
      conversation: conversationId,
      sender: "agent",
      senderUser: req.user._id,
      text: text.trim(),
    });

    conversation.lastMessageAt = new Date();
    conversation.agentRespondedAt = new Date();
    await conversation.save();

    const io = req.app.get("io");
    io.to(conversation.user.toString()).emit("newSupportMessage", {
      conversationId: conversation._id.toString(),
      message,
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error sending reply" });
  }
};

export const closeConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const conversation = await conversationModel.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.status = "closed";
    await conversation.save();

    const io = req.app.get("io");
    io.to(conversation.user.toString()).emit("conversationClosed", {
      conversationId: conversation._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Conversation closed",
      conversation,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error closing conversation" });
  }
};