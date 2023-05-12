// require('@babel/register')({
//   presets: ['@babel/preset-env']
// });
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from './swagger.json'
// const swaggerDocument = require('./swagger.json')
// const swaggerDocument = require('./swagger.json');
// import socketIO from 'socket.io'

import authRouter from "./routes/auth.js";
import postRouter from "./routes/post.js";
import commentRouter from "./routes/comment.js";
import userRouter from "./routes/user.js";
import chatRouter from "./routes/chat.js";
import Message from "./models/Message.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://social-media-ui-jade.vercel.app",
    ],
  })
);
dotenv.config();
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connect to mongoDB");
  } catch (error) {
    console.log(error);
  }
};

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

const PORT = process.env.PORT || 4000;

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("send-message", async (data) => {
    const message = new Message(data);
    await message.save();
    socket.to(data.receiver).emit("new-message", message);
  });
});

server.listen(PORT, () => {
  connect();
  console.log(`Server started on port ${PORT}`);
});
