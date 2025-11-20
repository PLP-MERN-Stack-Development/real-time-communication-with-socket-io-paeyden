const express = require('express');
const {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, sendMessage);
router.get('/:conversationId', authMiddleware, getMessages);
router.delete('/:messageId', authMiddleware, deleteMessage);
router.put('/:messageId', authMiddleware, editMessage);

module.exports = router;
