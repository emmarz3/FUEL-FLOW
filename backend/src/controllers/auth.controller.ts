import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import env from "../config/env";
import { AppError } from "../middleware/error.middleware";
import crypto from "crypto";

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Check if user exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already in use", StatusCodes.CONFLICT);
    }

    // Create user
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    });

    // Generate tokens
    const { accessToken, refreshToken } = authService.generateTokens(user);
    user.refreshToken = authService.hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await userService.findByEmail(email, true);
    if (!user) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    // Check if user is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(
        "Account temporarily locked. Please try again later.",
        StatusCodes.FORBIDDEN
      );
    }

    // Increment failed login attempts
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
    await user.save({ validateBeforeSave: false });

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const { accessToken, refreshToken } = authService.generateTokens(user);
    user.refreshToken = authService.hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (user) {
      user.refreshToken = "";
      await user.save({ validateBeforeSave: false });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", StatusCodes.BAD_REQUEST);
    }

    // Verify refresh token
    const decoded = authService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
    }

    // Get user
    const user = await userService.findById(decoded.id, true);
    if (!user) {
      throw new AppError("User no longer exists", StatusCodes.NOT_FOUND);
    }

    // Check refresh token matches
    if (user.refreshToken !== authService.hashToken(refreshToken)) {
      throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user);
    user.refreshToken = authService.hashToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await userService.findByEmail(email);
    if (!user) {
      throw new AppError("No user found with that email", StatusCodes.NOT_FOUND);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Reset token sent to email",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user
    const user = await userService.findByResetToken(hashedToken);
    if (!user) {
      throw new AppError("Token is invalid or has expired", StatusCodes.UNAUTHORIZED);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.changedPasswordAt = new Date();

    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};
