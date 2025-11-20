const express = require('express');
const {
  createConversation,
  getUserConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
  addParticipant,
  removeParticipant
} = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createConversation);
router.get('/', authMiddleware, getUserConversations);
router.get('/:conversationId', authMiddleware, getConversationById);
router.put('/:conversationId', authMiddleware, updateConversation);
router.delete('/:conversationId', authMiddleware, deleteConversation);
router.post('/:conversationId/participants', authMiddleware, addParticipant);
router.delete('/:conversationId/participants', authMiddleware, removeParticipant);

module.exports = router;
