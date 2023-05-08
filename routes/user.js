import express from 'express'
import { createSaveKey, getFriendBirthdayByMonth, getFriendBirthdayToday, getListFriend, getListRequestFriend, getPostByFriend, getSavedIds, getSavedPost, getSuggestFriend, getUser, requestAddFriend, responseRequestAddFriend, savedPost, searchUser, updateUser } from '../controllers/user.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

router.get('/:userId', getUser)
router.post('/saved/:savedId/:postId', verifyToken, savedPost)
router.get('/getSaved/saved-posts', verifyToken, getSavedPost)
router.get('/getSaved/getSavedIds', verifyToken, getSavedIds)
router.post('/saved/createSaveKey', verifyToken, createSaveKey)
router.post('/friend-requests/:recipientId', verifyToken, requestAddFriend)
router.get('/friend-requests/list', verifyToken, getListRequestFriend)
router.put('/:requestId', verifyToken, responseRequestAddFriend)
router.get('/friends-suggestions/list', verifyToken, getSuggestFriend)
router.get('/friends/:userId', getListFriend)
router.get('/postFromFriends/list', verifyToken, getPostByFriend)
router.put('/update/user', verifyToken, updateUser)
router.get('/friends/birthday/today', verifyToken, getFriendBirthdayToday)
router.get('/friends/birthday/:month', verifyToken, getFriendBirthdayByMonth)

router.get("/search/user", verifyToken, searchUser)

export default router