import express from 'express'
import { forgotPassword, login, logout, register, resetPassword } from '../controllers/auth.js'

const router = express.Router()
router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/logout', logout)


export default router