import mongoose from "mongoose";
import { createErr } from "../error.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Share from "../models/Share.js";

// API tạo 1 bài Post
export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const author = req.user.id;
    const authorPost = await User.findById(author);
    if (!authorPost) {
      return next(createErr(404, "Use không tồn tại!"));
    }
    const post = new Post({ content, author });
    await post.save();
    authorPost.posts.push(post);
    await authorPost.save();
    return res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// API lấy những bài Post của 1 user
export const getPostByUser = async (req, res, next) => {
  try {
    const author = req.user.id;
    const sharePost = await Share.find({ userId: author }).populate({
      path: "postId",
      populate: {
        path: "comments author",
      },
    });
    const a = [...sharePost].map(item => item.postId)
    // console.log("getPostByUser ~ sharePost:", sharePost)
    const myPosts = await Post.find({ author })
      .populate("comments")
      .populate("author");
    const posts = [...a, ...myPosts];
    // console.log("getPostByUser ~ allPost:", allPost)
    return res.status(200).json({
      success: true,
      message: "Lấy các bài post thành công",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API lấy ra thông tin của 1 bài Post
export const getAPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "-password"
    );
    console.log("getAPost ~ post:", post);
    if (!post) {
      return next(createErr(404, "Không tìm thấy bài đăng nào!"));
    }
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin bài đăng thành công",
      data: post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API sửa 1 bài Post
export const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    const userId = req.user.id;
    if (!post) {
      return next(createErr(404, "Không tìm thấy bài đăng nào!"));
    }
    if (post.author.toString() !== userId) {
      return next(createErr(403, "Bạn không được phép cập nhật bài viết này!"));
    }
    console.log(post)
    const updatePost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công",
      data: updatePost,
    });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

// API like bài post
export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: userId },
      },
      { new: true }
    ).populate("author likes", "name avatar");

    if (!post) {
      return next(createErr(404, "Bài đăng không tồn tại!"));
    }

    return res.status(200).json({
      success: true,
      message: "Like bài viết thành công",
      data: post,
    });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};
// API delete like post
export const unLikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    ).populate("author likes", "name avatar");

    if (!post) {
      return next(createErr(404, "Bài đăng không tồn tại!"));
    }
    return res.status(200).json({
      success: true,
      message: "unLike bài viết thành công",
      data: post,
    });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};
// API Share Post
export const sharePost = async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return next(createErr(404, "Bài post không tồn tại!"));
    }
    const share = await Share.create({ postId, userId });
    return res.status(201).json({
      success: true,
      message: "Share bài post thành công",
      data: share,
    });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};
