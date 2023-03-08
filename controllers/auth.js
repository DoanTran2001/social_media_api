import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createErr } from "../error.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    // Kiểm tra email đã được sử dụng hay chưa
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      // res.status(400).json({ success: false, message: "Email đã tồn tại" });
      return next(createErr(400, "Email đã tồn tại!"));
    }
    // Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      password: hash,
    });
    // Lưu user vào db
    const saveUser = await newUser.save();
    const token = jwt.sign(
      { id: saveUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    return res.status(201).json({
      success: true,
      message: "Đăng kí tài khoản thành công",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password: passwordBody } = req.body;
  try {
    const user = await User.findOne({ email: email });
    // Kiểm tra user đã có hay chưa
    if (!user) {
      return next(createErr(401, "Email hoặc mật khẩu không đúng!"));
    }
    const isPasswordSuccess = await bcrypt.compare(passwordBody, user.password);
    // Kiểm tra password có đúng hay không
    if (!isPasswordSuccess) {
      return next(createErr(401, "Email hoặc mật khẩu không đúng!"));
    }
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET);
    const { password, ...others } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          token,
          user: others,
        },
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Lỗi máy chủ");
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(createErr(400, "Tài khoản không tồn tại!"));
    }
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const link = `http://localhost:3000/resetpassword/${user._id}/${token}`;
    await sendEmail(user.email, "Password Reset", link);
    res.send("password reset link sent to your email account");
  } catch (error) {}
};

export const resetPassword = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(createErr(400, "Token hết hạn hoặc không hợp lệ"));
  }
  // Cập nhật mật khẩu mới
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  // Tạo token mới để đăng nhập
  const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET);
  res
    .cookie("access_token", token, {
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
};


