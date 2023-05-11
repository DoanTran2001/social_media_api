import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
} from "../controllers/auth.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.put("/change-password", verifyToken, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", logout);

export default router;
