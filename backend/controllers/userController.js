import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import logger from "../utils/logger.js";
import { sendVerificationEmail } from "../services/emailVerificationService.js";

const ACCESS_TOKEN_EXPIRES = "30m";
const REFRESH_TOKEN_EXPIRES = "30d";
const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const issueAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
    algorithm: "HS256",
  });

const issueRefreshToken = (user) =>
  jwt.sign({ id: user._id, v: user.refreshTokenVersion }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
    algorithm: "HS256",
  });

// The refresh cookie is scoped to /api/user (its only consumers) and never
// exposed to JS, so a leaked access token or an XSS payload can't steal it.
const setRefreshCookie = (res, refreshToken, rememberMe = true) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/user",
  };
  // Only set maxAge for persistent sessions (remember me);
  // omitting maxAge creates a session cookie that dies with the browser.
  if (rememberMe) {
    cookieOptions.maxAge = REFRESH_COOKIE_MAX_AGE_MS;
  }
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/user" });
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  photo: user.photo,
  role: user.role,
  emailVerified: user.emailVerified,
});

// REGISTER
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, photo } = req.body;

    if (!name || !email || !password || !phone) {
      return res.json({
        success: false,
        message: "All required fields must be filled (name, email, password, phone)",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAutoVerify = process.env.AUTO_VERIFY_EMAIL === "true";

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      photo: photo || "",
      role: "user",
      emailVerified: isAutoVerify,
    });

    const user = await newUser.save();
    
    if (!isAutoVerify) {
      await sendVerificationEmail(user);
    }

    const token = issueAccessToken(user);
    setRefreshCookie(res, issueRefreshToken(user));

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const token = issueAccessToken(user);
    setRefreshCookie(res, issueRefreshToken(user), rememberMe);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH ACCESS TOKEN (silent refresh via httpOnly cookie)
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
    } catch {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await userModel.findById(decoded.id);
    if (!user || user.refreshTokenVersion !== decoded.v) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: "Session revoked, please log in again" });
    }

    const token = issueAccessToken(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

// LOGOUT — revokes every outstanding refresh token for this user
export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
        await userModel.findByIdAndUpdate(decoded.id, { $inc: { refreshTokenVersion: 1 } });
      } catch {
        // Token already invalid/expired — nothing to revoke.
      }
    }
    clearRefreshCookie(res);
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    const genericMessage = "If that email exists, a reset link has been sent";

    if (!user) {
      return res.json({ success: true, message: genericMessage });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to user
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 60 minutes
    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;
    const htmlMessage = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    `;

    try {
      logger.info({ email: user.email, resetUrl }, "Password reset link generated");
      await sendEmail({
        email: user.email,
        subject: "DevGo - Password Reset",
        message: message,
        html: htmlMessage,
      });

      res.json({ success: true, message: genericMessage });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.error({ err: error, email: user.email, resetUrl }, "Password reset email send failed");
      return res.json({ success: true, message: genericMessage });
    }
  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.json({ success: false, message: "Please provide a new password" });
    }

    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired reset token" });
    }

    // Invalidate the token before setting the new password so a leaked/raced
    // token can't be reused to trigger a second reset.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // A password change should also log out every other active session.
    user.refreshTokenVersion += 1;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// GET ALL USERS (ADMIN) — cursor-based (keyset) pagination, see getAllBookings
// in bookingController.js for why this replaces skip/limit.
export const getAllUsers = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { cursor } = req.query;

    const filter = cursor ? { _id: { $lt: cursor } } : {};
    const users = await userModel.find(filter, "-password").sort({ _id: -1 }).limit(limit);

    const nextCursor = users.length === limit ? users[users.length - 1]._id : null;
    res.json({ success: true, users, nextCursor });
  } catch (error) {
    next(error);
  }
};

// DELETE USER (ADMIN)
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// UPDATE PROFILE (USER)
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, phone } = req.body;
    
    // We only update what was provided
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    // Handle photo upload
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};
