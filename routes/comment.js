import express from 'express'
import { createComment, getCommentOfPost, replyComment, updateComment, updateSubComment } from '../controllers/comment.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()
router.post('/:postId', verifyToken, createComment)
router.get('/:postId', getCommentOfPost)
router.post('/:postId/:commentId',verifyToken, replyComment)
router.put('/:postId/:commentId',verifyToken, updateComment)
router.put('/:postId/:commentId/:subcommentId',verifyToken, updateSubComment)



export default router