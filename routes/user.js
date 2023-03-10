import express from 'express'
import { getListFriend, getListRequestFriend, getUser, requestAddFriend, responseRequestAddFriend } from '../controllers/user.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

router.get('/:userId', getUser)
router.post('/friend-requests/:recipientId', verifyToken, requestAddFriend)
router.get('/friend-requests/list', verifyToken, getListRequestFriend)
router.put('/:requestId', verifyToken, responseRequestAddFriend)
router.get('/friends/:userId', getListFriend)

export default router