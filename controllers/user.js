import { createErr } from "../error.js";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

// API lấy ra thông tin của user
export const getUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "comments author",
      },
    });
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
// API update thông tin user
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // console.log(req.body);
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    // console.log(user);
    if (!user) {
      return next(createErr(404, "User không tồn tại!"));
    }
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin user thành công!",
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
    const request = await FriendRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "avatar name");

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
// API lấy danh sách bạn bè và các bài post của bạn bè đó
export const getListFriend = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại"));
    }
    const friendIds = user.friends;
    const friends = await User.find({ _id: { $in: friendIds } });
    const friendPosts = await Post.find({ author: { $in: friendIds } })
      .sort({ createdAt: -1 })
      .populate("author");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bạn bè thành công",
      data: friends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Lấy ra những bài post của bạn bè
export const getPostByFriend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại"));
    }
    const friendIds = user.friends;
    const friendPosts = await Post.find({ author: { $in: friendIds } })
      .sort({ createdAt: -1 })
      .populate("author likes", "name avatar _id");
    const data = friendPosts.map((post) => {
      const foundKey = [...user.saved.entries()].find(([k, v]) =>
        v.includes(post._id)
      );
      const savedKey = foundKey ? foundKey[0] : null;
      return { ...post.toObject(), savedKey };
    });
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bạn bè thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Lấy ra gợi ý bạn bè
export const getSuggestFriend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("friends");
    // const friendIds = await User.distinct("friends", { _id: userId });
    const friendIds = user.friends.map((friend) => friend._id);
    const requests = await FriendRequest.find({
      $or: [{ requester: userId }, { recipient: userId }],
    });
    const requestIds = requests.map((friendRequest) => {
      if (friendRequest.requester.toString() === userId) {
        return friendRequest.recipient;
      } else {
        return friendRequest.requester;
      }
    });
    const suggestFriend = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { _id: { $nin: [...friendIds, ...requestIds, userId] } }, // không có trong danh sách bạn bè, yêu cầu kết bạn và không phải là chính mình
      ],
    });
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách gợi ý bạn bè thành công!",
      data: suggestFriend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save post
export const savedPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { savedId, postId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại"));
    }
    const post = await Post.findById(postId);
    if (!post) {
      return next(createErr(404, "Bài đăng không tồn tại"));
    }
    if (!user.saved) {
      user.saved = new Map();
    }
    if (!user.saved.get(savedId)) {
      user.saved.set(savedId, []);
    }
    if (user.saved.get(savedId).includes(postId)) {
      return res.status(200).json({
        success: true,
        message: "Bài viết đã được lưu trước đó",
      });
    }
    user.saved.get(savedId).push(postId);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Lưu bài viết thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Unsave Post
export const unSavedPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { savedId, postId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại"));
    }
    if (!user.saved.get(savedId)) {
      return res.status(200).json({
        success: true,
        message: "Người dùng chưa lưu bài viết vào key này",
      });
    }
    const index = user.saved.get(savedId).indexOf(postId);
    if (index === -1) {
      return res.status(200).json({
        success: true,
        message: "Người dùng chưa lưu bài viết này",
      });
    }
    user.saved.get(savedId).splice(index, 1);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Hủy bỏ lưu bài viết thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Save post
export const getSavedPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { key, page, limit } = req.query;
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại!"));
    }
    let savedPost = [];
    if (key === "all") {
      savedPost = [...user.saved.values()].reduce((acc, cur) => {
        return acc.concat(cur);
      }, []);
    } else {
      savedPost = user.saved.get(key);
    }
    if (!savedPost) {
      return res.status(200).json({
        success: true,
        message: `Không có bài đăng nào được lưu ở bộ sưu tập: ${key}`,
        data: [],
      });
    }
    const totalPosts = savedPost.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const skip = (page - 1) * limit;
    const posts = await Post.find({ _id: { $in: savedPost } })
      .populate("author likes", "name avatar _id")
      .skip(skip)
      .limit(limit);
    const data = posts.map((post) => {
      const foundKey = [...user.saved.entries()].find(([k, v]) =>
        v.includes(post._id)
      )[0];
      return { ...post.toObject(), savedKey: foundKey };
    });
    return res.status(200).json({
      success: true,
      message: `Lấy danh sách bài đăng đã lưu ở trong bộ sưu tập: ${key} thành công`,
      data,
      meta: {
        totalPosts,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API create save key
export const createSaveKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { key } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại!"));
    }
    if (user.saved.has(key)) {
      return next(createErr(400, `Key ${key} đã tồn tại`));
    }
    user.saved.set(key, []);
    await user.save();
    return res.status(201).json({
      success: true,
      message: `Tạo key: ${key} thành công!`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get savedID
export const getSavedIds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createErr(404, "User không tồn tại"));
    }
    return res.status(200).json({
      success: true,
      data: user.saved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFriendBirthdayToday = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const user = await User.findById(userId);
    const friends = await User.aggregate([
      {
        $match: {
          _id: { $in: user.friends },
        },
      },
      {
        $addFields: {
          month: { $month: "$date_of_birth" },
          day: { $dayOfMonth: "$date_of_birth" },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$month", today.getMonth() + 1] },
              { $eq: ["$day", today.getDate()] },
            ],
          },
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      message: "Lấy user có ngày sinh là ngày hôm nay thành công!",
      data: friends,
    });
    // res.json(friendsWithTodayBirthday);
  } catch (error) {
    console.log(error.message);
  }
};

export const getFriendBirthdayByMonth = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month } = req.params;
    const user = await User.findById(userId);
    const friends = await User.aggregate([
      {
        $match: {
          _id: { $in: user.friends },
        },
      },
      {
        $addFields: {
          birthMonth: { $month: "$date_of_birth" },
        },
      },
      {
        $match: {
          $expr: {
            $eq: ["$birthMonth", parseInt(month)],
          },
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      message: `Lấy user có ngày sinh là tháng ${month} thành công!`,
      data: friends.map((friend) => ({
        _id: friend._id,
        name: friend.name,
        avatar: friend.avatar,
        date_of_birth: friend.date_of_birth,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUser = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return next(createErr(400, "Missing query parameter"));
    }
    const users = await User.find({
      $or: [
        {
          name: { $regex: query, $options: "i" },
        },
        { email: { $regex: query, $options: "i" } },
      ],
    });
    return res.status(200).json({
      success: true,
      message: "Search thành công!",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
