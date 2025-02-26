const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../authMiddleware');

router.get('/conversations', authMiddleware, userController.getConversation);

router.post('/create', authMiddleware, userController.createConversation);

router.get('/search', userController.getUsers);

router.post('/send', authMiddleware, userController.send);

router.get('/messages/:conversationId', authMiddleware, userController.getMessages);

module.exports = router;
