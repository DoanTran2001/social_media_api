import { createErr } from "../error.js";
import Message from "../models/Message.js";

export const createChatMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { receiverId, content } = req.body
    const newMessage = new Message({
      sender: userId,
      receiver: receiverId,
      content
    })
    await newMessage.save()
    return res.status(201).json({
      success: true,
      message: "Tin nhắn đã được gửi thành công!",
      data: newMessage
    })
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Lấy danh sách chat giữa hai người dùng
export const getChatMessages = async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.params
    // console.log(senderId, receiverId)
    // Kiểm tra tồn tại của người gửi và người nhận
    // const senderExists = await User.exists({ _id: senderId });
    // const receiverExists = await User.exists({ _id: receiverId });
    // if (!senderExists || !receiverExists) {
    //   return next(createErr(404, "Người dùng không tồn tại!"))
    // }
    // Lấy danh sách chat giữa hai người dùng
    const messages = await Message.find({
      $or: [
        {sender: senderId, receiver: receiverId },
        {sender: receiverId, receiver: senderId}
      ]
    }).populate('sender', "name avatar").populate("receiver", "name avatar")
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách chat giữa hai người thành công",
      data: messages
    })
  } catch (error) {
    res.status(500).json(error.message);
  }
}
// API lấy danh sách người dùng đã chat với người dùng hiện tại
export const getChatContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Kiểm tra sự tồn tại của người dùng
    // const userExists = await User.exists({ _id: userId });
    // if (!userExists) {
    //   return next(createErr(404, "Người dùng không tồn tại!"))
    // }
    // Lấy danh sách người dùng đã chat với người dùng hiện tại
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).distinct('sender receiver');
    // Lọc bỏ người dùng hiện tại khỏi danh sách
    const users = messages.filter(user => user.toString() !== userId);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json(error.message);
  }
}
