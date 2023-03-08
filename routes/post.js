import express from 'express'
import { createPost, getAPost, getPostByUser, updatePost } from '../controllers/post.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()
router.post('/', verifyToken, createPost)
router.get('/', verifyToken, getPostByUser)
router.get('/:id', getAPost)
router.put('/:postId', verifyToken, updatePost)


export default router