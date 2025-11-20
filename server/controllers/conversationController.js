const Conversation = require('../models/conversation');
const Message = require('../models/message');

// Create a new conversation (direct or group)
exports.createConversation = async (req, res) => {
  try {
    const { participants, isGroup, groupName, groupAvatarUrl } = req.body;

    // Prevent duplicate direct conversations
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        type: 'direct',
        participants: { $all: participants, $size: 2 }
      });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const conversation = new Conversation({
      participants,
      type: isGroup ? 'group' : 'direct',
      groupName: groupName || '',
      groupAvatarUrl: groupAvatarUrl || '',
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Error creating conversation', error: err.message });
  }
};

// Get all conversations for a user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'username avatar')
      .populate('lastMessage');

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching conversations', error: err.message });
  }
};

// Get a single conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'username avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: 'username avatar' }
      });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching conversation', error: err.message });
  }
};

// Update group conversation details
exports.updateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const updates = req.body;

    const conversation = await Conversation.findByIdAndUpdate(conversationId, updates, { new: true });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation updated successfully', data: conversation });
  } catch (err) {
    res.status(500).json({ message: 'Error updating conversation', error: err.message });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Message.deleteMany({ conversationId }); // cleanup messages
    await conversation.remove();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting conversation', error: err.message });
  }
};

// Add a participant to a group conversation
exports.addParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Cannot add participants to a direct conversation' });
    }

    // Prevent duplicates
    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ message: 'User already a participant' });
    }

    conversation.participants.push(userId);
    await conversation.save();

    res.json({ message: 'Participant added successfully', data: conversation });
  } catch (err) {
    res.status(500).json({ message: 'Error adding participant', error: err.message });
  }
};

// Remove a participant from a group conversation
exports.removeParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Cannot remove participants from a direct conversation' });
    }

    conversation.participants = conversation.participants.filter(
      (participant) => participant.toString() !== userId
    );

    await conversation.save();

    res.json({ message: 'Participant removed successfully', data: conversation });
  } catch (err) {
    res.status(500).json({ message: 'Error removing participant', error: err.message });
  }
};