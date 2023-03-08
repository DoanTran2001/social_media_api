import mongoose from "mongoose";
import { createErr } from "../error.js";
import Post from "../models/Post.js";



// API tạo 1 bài Post
export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const author = req.user.id;
    console.log("createPost ~ author:", author);
    const post = new Post({ content, author });
    await post.save();
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
    const posts = await Post.find({ author });
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
    const post = await Post.findById(postId)
    const userId = req.user.id
    if (!post) {
      return next(createErr(404, "Không tìm thấy bài đăng nào!"));
    }
    if(post.author.toString() !== userId) {
      return next(createErr(403, "Bạn không được phép cập nhật bài viết này!"))
    }
    const updatePost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: req.body,
      },
      { new: true }
    )
    return res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công",
      data: updatePost
    })
  } catch (error) {
    res.status(500).json({ message: err.message })
  }
};
