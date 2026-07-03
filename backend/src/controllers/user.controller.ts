import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import User from "../models/User";
import { AppError } from "../middleware/error.middleware";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(StatusCodes.OK).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, billingAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, billingAddress },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");
    
    res.status(StatusCodes.OK).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError("Incorrect current password", StatusCodes.BAD_REQUEST);
    
    user.password = newPassword;
    user.changedPasswordAt = new Date();
    await user.save();
    
    res.status(StatusCodes.OK).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");
    
    res.status(StatusCodes.OK).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
