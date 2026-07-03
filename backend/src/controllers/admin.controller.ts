import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/User";
import vendorModel from "../models/Vendor";
import driverModel from "../models/Driver";
import subscriptionModel from "../models/Subscription";
import paymentModel from "../models/Payment";
import webhookLogModel from "../models/WebhookLog";
import { AppError } from "../middleware/error.middleware";

// @desc    Get admin statistics
// @route   GET /api/v1/admin/stats
// @access  Admin
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalDrivers,
      totalSubscriptions,
      totalRevenue,
      totalPayments,
    ] = await Promise.all([
      UserModel.countDocuments(),
      vendorModel.countDocuments(),
      driverModel.countDocuments(),
      subscriptionModel.countDocuments(),
      paymentModel.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      paymentModel.countDocuments(),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalUsers,
        totalVendors,
        totalDrivers,
        totalSubscriptions,
        totalRevenue: revenue,
        totalPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Admin
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendors
// @route   GET /api/v1/admin/vendors
// @access  Admin
export const getAllVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendors = await vendorModel.find()
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all drivers
// @route   GET /api/v1/admin/drivers
// @access  Admin
export const getAllDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await driverModel.find()
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscriptions
// @route   GET /api/v1/admin/subscriptions
// @access  Admin
export const getAllSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await subscriptionModel.find()
      .populate("user", "email firstName lastName")
      .populate("vendor", "businessName")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/v1/admin/payments
// @access  Admin
export const getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentModel.find()
      .populate("user", "email firstName lastName")
      .populate("subscription", "fuelType amount")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(StatusCodes.OK).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get webhook logs
// @route   GET /api/v1/admin/webhooks
// @access  Admin
export const getWebhookLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await webhookLogModel.find()
      .sort({ receivedAt: -1 })
      .limit(100);

    res.status(StatusCodes.OK).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get failed payments
// @route   GET /api/v1/admin/failed-payments
// @access  Admin
export const getFailedPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const failedPayments = await paymentModel.find({ status: "failed" })
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: failedPayments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get retry queue
// @route   GET /api/v1/admin/retry-queue
// @access  Admin
export const getRetryQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingPayments = await paymentModel.find({ status: "pending" })
      .populate("user", "email firstName lastName")
      .sort({ nextRetryAt: 1 });

    res.status(StatusCodes.OK).json({ success: true, data: pendingPayments });
  } catch (error) {
    next(error);
  }
};