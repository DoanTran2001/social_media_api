import jwt from 'jsonwebtoken';
import { createErr } from './error.js';

// Xác thực token.
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; // Lấy token trong cookie ở phần access_token
  console.log("verifyToken ~ token:", token)
  if(!token) return next(createErr(401, "Quá trình xác thực thất bại")); // Nếu không có token thì tạo lỗi 401 với thông báo "Bạn chưa được xác thực";

  // Kiểm tra JWT có đúng hay k
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return next(createErr(403, "Token is not valid!")); // Nếu có lỗi thì tạo lỗi 403, Token không hợp lệ
    req.user = user; // Thêm thuộc tính cho req gửi lúc gửi lên là payload. user là payload lúc decode
    next();
  })
}


