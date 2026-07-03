import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/User";
import vendorModel from "../models/Vendor";
import driverModel from "../models/Driver";
import subscriptionModel from "../models/Subscription";
import paymentModel from "../models/Payment";
import deliveryModel from "../models/Delivery";
import { AppError } from "../middleware/error.middleware";

// @desc    Get analytics dashboard
// @route   GET /api/v1/analytics
// @access  Admin/Manager
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalDrivers,
      totalSubscriptions,
      totalRevenue,
      totalPayments,
      totalDeliveries,
    ] = await Promise.all([
      UserModel.countDocuments(),
      vendorModel.countDocuments(),
      driverModel.countDocuments(),
      subscriptionModel.countDocuments(),
      paymentModel.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      paymentModel.countDocuments(),
      deliveryModel.countDocuments(),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Calculate success rate
    const successPayments = await paymentModel.countDocuments({ status: "success" });
    const successRate = totalPayments > 0 ? (successPayments / totalPayments) * 100 : 0;

    // Calculate churn rate
    const cancelledSubscriptions = await subscriptionModel.countDocuments({ status: "cancelled" });
    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalRevenue: revenue,
        totalUsers,
        totalVendors,
        totalDrivers,
        totalSubscriptions,
        totalPayments,
        totalDeliveries,
        successRate: Math.round(successRate * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue analytics
// @route   GET /api/v1/analytics/revenue
// @access  Admin/Manager
export const getRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const monthlyRevenue = await paymentModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = await paymentModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription analytics
// @route   GET /api/v1/analytics/subscriptions
// @access  Admin/Manager
export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptionsByStatus = await subscriptionModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const activeSubscriptions = subscriptionsByStatus.find((s) => s._id === "active")?.count || 0;
    const pausedSubscriptions = subscriptionsByStatus.find((s) => s._id === "paused")?.count || 0;
    const cancelledSubscriptions = subscriptionsByStatus.find((s) => s._id === "cancelled")?.count || 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        subscriptionsByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer analytics
// @route   GET /api/v1/analytics/customers
// @access  Admin/Manager
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalCustomers = await UserModel.countDocuments();
    const verifiedCustomers = await UserModel.countDocuments({ isEmailVerified: true, isPhoneVerified: true });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalCustomers,
        verifiedCustomers,
        verificationRate: totalCustomers > 0 ? (verifiedCustomers / totalCustomers) * 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment analytics
// @route   GET /api/v1/analytics/payments
// @access  Admin/Manager
export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paymentsByStatus = await paymentModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const failedPayments = paymentsByStatus.find((s) => s._id === "failed")?.count || 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        paymentsByStatus,
        failedPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery analytics
// @route   GET /api/v1/analytics/deliveries
// @access  Admin/Manager
export const getDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliveriesByStatus = await deliveryModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const totalDeliveries = await deliveryModel.countDocuments();
    const deliveredCount = deliveriesByStatus.find((s) => s._id === "delivered")?.count || 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        deliveriesByStatus,
        totalDeliveries,
        deliveryRate: totalDeliveries > 0 ? (deliveredCount / totalDeliveries) * 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get churn rate
// @route   GET /api/v1/analytics/churn-rate
// @access  Admin/Manager
export const getChurnRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalSubscriptions = await subscriptionModel.countDocuments();
    const cancelledSubscriptions = await subscriptionModel.countDocuments({ status: "cancelled" });

    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        churnRate: Math.round(churnRate * 100) / 100,
        totalSubscriptions,
        cancelledSubscriptions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fuel consumption analytics
// @route   GET /api/v1/analytics/fuel-consumption
// @access  Admin/Manager
export const getFuelConsumption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const petrolConsumption = await deliveryModel.countDocuments({ fuelType: "petrol" });
    const dieselConsumption = await deliveryModel.countDocuments({ fuelType: "diesel" });
    const lpgConsumption = await deliveryModel.countDocuments({ fuelType: "lpg" });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        petrol: petrolConsumption,
        diesel: dieselConsumption,
        lpg: lpgConsumption,
        total: petrolConsumption + dieselConsumption + lpgConsumption,
      },
    });
  } catch (error) {
    next(error);
  }
};