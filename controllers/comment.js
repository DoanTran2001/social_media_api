import { createErr } from "../error.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// API tạo mới một comment cho một bài post
export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return next(createErr(404, "Bài viết không tồn tại!"));
    }
    const comment = new Comment({
      content,
      author: userId,
      post: postId,
    });
    await comment.save();
    post.comments.push(comment);
    await post.save();
    return res.status(201).json({
      success: true,
      message: "Comment thành công",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API lấy danh sách các comment của một bài post
export const getCommentOfPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return next(createErr(404, "Bài viết không tồn tại!"));
    }
    const comments = await Comment.find({ post: postId })
      .populate("author", "name _id avatar")
      .populate({
        path: "subComments.author",
        model: "User",
        select: "name _id avatar",
      });
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách comment của bài đăng thành công",
      data: {
        comments,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
// API trả lời comment của 1 bài post
export const replyComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId).populate("comments");
    if (!post) {
      return next(createErr(404, "Bài đăng không tồn tại"));
    }

    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return next(createErr(404, "Comment không tồn tại!"));
    }
    const reply = {
      content: req.body.content,
      author: req.user.id,
      createdAt: new Date(),
    };
    comment.subComments.push(reply);
    await post.save();
    await comment.save();
    return res.status(200).json({
      success: true,
      message: "Trả lời commnet thành công",
      data: reply,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API chỉnh sửa comment
export const updateComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId).populate("comments");
    if (!post) {
      return next(createErr(404, "Bài đăng không tồn tại!"));
    }
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return next(createErr(404, "Comment không tồn tại!"));
    }
    if (comment.author.toString() !== req.user.id) {
      return next(createErr(401, "Bạn không có quyền chỉnh sửa comment này!"));
    }
    comment.content = content;
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Chỉnh sửa bình luận thành công!",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API chỉnh sửa subComment
export const updateSubComment = async (req, res, next) => {
  try {
    const { postId, commentId, subcommentId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId).populate("comments");
    if (!post) {
      return next(createErr(404, "Bài đăng không tồn tại"));
    }
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return next(createErr(404, "Comment không tồn tại!"));
    }
    const replyComment = comment.subComments?.id(subcommentId);
    if (!replyComment) {
      return next(createErr(404, "ReplyComment không tồn tại"));
    }
    if (replyComment.author.toString() !== req.user.id) {
      return next(createErr(401, "Bạn không có quyền chỉnh sửa comment này"));
    }
    replyComment.content = content;
    await comment.save();
    return res.status(200).json({
      success: true,
      message: "Chỉnh sửa comment thành công",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API xóa comment
export const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(createErr(404, "Không tìm thấy bài viết!"));
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(createErr(404, "Không tìm thấy bình luận!"));
    }
    await Comment.updateOne({ _id: commentId }, { $unset: { subComments: 1 } }); // Xóa subComment
    await Comment.findByIdAndDelete(commentId); // Xóa comment
    post.comments = post.comments.filter((c) => c.toString() !== commentId.toString())
    await post.save()
    return res.status(200).json({
      success: true,
      message: "Xóa bình luận thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// API xóa replyComment
export const deleteReplyComment = async (req, res, next) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(createErr(404, "Không tìm thấy bài viết!"));
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(createErr(404, "Không tìm thấy bình luận!"));
    }
    const replyComment = comment.subComments.find(
      (c) => c._id.toString() === replyId
    );
    if (!replyComment) {
      return next(createErr(404, "Không tìm thấy phản hồi!"));
    }
    await Comment.updateOne(
      { _id: commentId },
      { $pull: { subComments: { _id: replyId } } }
    );
    comment.subComments = comment.subComments.filter((c) => c._id.toString());
    await comment.save();
    return res.status(200).json({
      success: true,
      message: "Xóa bình luận phản hồi thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
