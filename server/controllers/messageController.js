const Message = require('../models/message');
const Conversation = require('../models/conversation');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user.id; // comes from authMiddleware

    // Create and save message
    const message = new Message({
      conversationId,
      senderId,
      text,
      timestamp: new Date(),
    });

    await message.save();

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

// Get all messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.remove();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting message', error: err.message });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.text = text;
    message.editedAt = new Date();
    await message.save();

    res.json({ message: 'Message updated successfully', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Error editing message', error: err.message });
  }
};
