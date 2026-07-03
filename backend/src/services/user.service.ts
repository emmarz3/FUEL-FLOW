import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../middleware/error.middleware";
import crypto from "crypto";

class UserService {
  // Find user by email
  async findByEmail(email: string, withPassword = false) {
    const select = withPassword ? "+password" : "-password -refreshToken";
    return User.findOne({ email }).select(select);
  }

  // Find user by ID
  async findById(id: string, withPassword = false) {
    const select = withPassword ? "+password" : "-password -refreshToken";
    return User.findById(id).select(select);
  }

  // Create user
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
  }) {
    return User.create(data);
  }

  // Update user
  async updateUser(id: string, data: Partial<any>) {
    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Delete user
  async deleteUser(id: string) {
    return User.findByIdAndDelete(id);
  }

  // Get all users
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .select("-password -refreshToken");

    const total = await User.countDocuments();

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // Get user by reset token
  async findByResetToken(token: string) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    return user;
  }

  // Get user profile
  async getProfile(userId: string) {
    return User.findById(userId).select("-password -refreshToken");
  }

  // Update profile
  async updateProfile(userId: string, data: Partial<any>) {
    return User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Incorrect current password", StatusCodes.BAD_REQUEST);
    }

    user.password = newPassword;
    user.changedPasswordAt = new Date();
    await user.save();

    return user;
  }

  // Forgot password
  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    return resetToken;
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Token invalid or expired", StatusCodes.UNAUTHORIZED);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return user;
  }
}

export default new UserService();
