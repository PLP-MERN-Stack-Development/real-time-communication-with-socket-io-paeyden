const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
  },
  groupName: { type: String, default: '' },
  groupAvatarUrl: { type: String, default: '' },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  unreadCounts: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      count: { type: Number, default: 0 },
    },
  ],
  settings: {
    mute: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);