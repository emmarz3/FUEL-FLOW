import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import vendorModel from "../models/Vendor";
import deliveryModel from "../models/Delivery";
import subscriptionModel from "../models/Subscription";
import paymentModel from "../models/Payment";
import { AppError } from "../middleware/error.middleware";

// @desc    Get vendor orders
// @route   GET /api/v1/vendors/orders
// @access  Vendor
export const getVendorOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorModel.findOne({ user: req.user._id });
    if (!vendor) throw new AppError("Vendor not found", StatusCodes.NOT_FOUND);

    const orders = await deliveryModel.find({ vendor: vendor._id })
      .populate("customer", "email firstName lastName")
      .populate("driver", "user")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor customers
// @route   GET /api/v1/vendors/customers
// @access  Vendor
export const getVendorCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorModel.findOne({ user: req.user._id });
    if (!vendor) throw new AppError("Vendor not found", StatusCodes.NOT_FOUND);

    const customers = await deliveryModel.find({ vendor: vendor._id })
      .distinct("customer");

    res.status(StatusCodes.OK).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor revenue
// @route   GET /api/v1/vendors/revenue
// @access  Vendor
export const getVendorRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorModel.findOne({ user: req.user._id });
    if (!vendor) throw new AppError("Vendor not found", StatusCodes.NOT_FOUND);

    const revenue = await paymentModel.aggregate([
      { $match: { user: { $in: await subscriptionModel.find({ vendor: vendor._id }).distinct("user") } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
        totalPayments: revenue.length > 0 ? revenue[0].count : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory
// @route   PATCH /api/v1/vendors/inventory
// @access  Vendor
export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorModel.findOne({ user: req.user._id });
    if (!vendor) throw new AppError("Vendor not found", StatusCodes.NOT_FOUND);

    const { fuelType, quantity, unit } = req.body;

    const existingItem = vendor.inventory.find((item) => item.fuelType === fuelType);
    if (existingItem) {
      existingItem.quantity = quantity;
      existingItem.unit = unit;
      existingItem.lastUpdated = new Date();
    } else {
      vendor.inventory.push({
        fuelType,
        quantity,
        unit: unit || "liters",
        lastUpdated: new Date(),
      });
    }

    await vendor.save();

    res.status(StatusCodes.OK).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor analytics
// @route   GET /api/v1/vendors/analytics
// @access  Vendor
export const getVendorAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorModel.findOne({ user: req.user._id });
    if (!vendor) throw new AppError("Vendor not found", StatusCodes.NOT_FOUND);

    const analytics = await Promise.all([
      deliveryModel.countDocuments({ vendor: vendor._id }),
      paymentModel.countDocuments({}),
      subscriptionModel.countDocuments({ vendor: vendor._id }),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalDeliveries: analytics[0],
        totalRevenue: vendor.totalRevenue,
        totalOrders: analytics[2],
        rating: vendor.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};