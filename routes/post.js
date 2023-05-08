import express from 'express'
import { createPost, getAPost, getPostByUser, likePost, sharePost, unLikePost, updatePost } from '../controllers/post.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()
router.post('/', verifyToken, createPost)
router.post('/likes/:postId', verifyToken, likePost)
router.post('/shares/:postId', verifyToken, sharePost) // Share a post
router.delete('/unlikes/:postId', verifyToken, unLikePost)
router.get('/', verifyToken, getPostByUser)
router.get('/:id', getAPost)
router.put('/:postId', verifyToken, updatePost)


export default router