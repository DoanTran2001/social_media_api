import express from 'express'
import { verifyToken } from "../verifyToken.js";
import { createChatMessage, getChatContacts, getChatMessages } from '../controllers/chat.js';
const router = express.Router()

router.post('/messages', verifyToken, createChatMessage)
router.get('/messages/:senderId/:receiverId', getChatMessages)
router.get("/messages/getChatContacts", verifyToken, getChatContacts)

export default router
