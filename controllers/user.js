import { createErr } from "../error.js";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

// API lấy ra thông tin của user
export const getUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại!"));
    }
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin user thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// API gửi yêu cầu kết bạn
export const requestAddFriend = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const requesterId = req.user.id;

    const requester = await User.findById(requesterId);
    const recipient = await User.findById(recipientId);

    if (!requester || !recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      requester.friends.includes(recipientId) ||
      recipient.friends.includes(requesterId)
    ) {
      return res.status(400).json({ message: "Already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
      requester: requesterId,
      recipient: recipientId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const newRequest = new FriendRequest({
      requester: requesterId,
      recipient: recipientId,
    });

    await newRequest.save();

    return res.status(200).json({
      success: true,
      message: "Gửi yêu cầu kết bạn thành công",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API danh sách yêu cầu kết bạn
export const getListRequestFriend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const request = await FriendRequest.find({ recipient: userId });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách lời mời kết bạn thành công",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API phản hồi yêu cầu kết bạn
export const responseRequestAddFriend = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return next(createErr(404, "Request not found"));
    }
    request.status = status;
    await request.save();

    if (status === "accepted") {
      const requester = await User.findById(request.requester);
      const recipient = await User.findById(request.recipient);

      requester.friends.push(recipient._id);
      recipient.friends.push(requester._id);

      await requester.save();
      await recipient.save();
      res.status(200).json({
        success: true,
        message: "Chấp nhận kết bạn thành công",
      });
    } else if (status === "declined") {
      const requester = await User.findById(request.requester);
      const recipient = await User.findById(request.recipient);

      if (requester && recipient) {
        requester.friends = requester.friends.filter(
          (item) => item.toString() !== recipient._id
        );
        recipient.friends = recipient.friends.filter(
          (item) => item.toString() !== requester._id
        );

        await requester.save();
        await recipient.save();
      }
      await FriendRequest.findByIdAndRemove(requestId);
      res.status(200).json({
        message: "Xóa kết bạn thành công",
      });
    }
  } catch (error) {}
};
// API lấy danh sách bạn bè
export const getListFriend = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("friends");

    if (!user) {
      return next(createErr(404, "User không tồn tại"));
    }
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bạn bè thành công",
      data: user.friends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
