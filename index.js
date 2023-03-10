import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import authRouter from './routes/auth.js'
import postRouter from './routes/post.js'
import commentRouter from './routes/comment.js'
import userRouter from './routes/user.js'


const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}))
dotenv.config()

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connect to mongoDB");
  } catch (error) {
    console.log(error);
  }
}

app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/comment', commentRouter)
app.use('/api/user', userRouter)

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message
  })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  connect()
  console.log(`Server started on port ${PORT}`)
})
