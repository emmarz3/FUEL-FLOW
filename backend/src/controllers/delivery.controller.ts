import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import deliveryModel from "../models/Delivery";
import fuelOrderModel from "../models/FuelOrder";
import vendorModel from "../models/Vendor";
import driverModel from "../models/Driver";
import paymentModel from "../models/Payment";
import { AppError } from "../middleware/error.middleware";

// @desc    Create a new delivery
// @route   POST /api/v1/deliveries
// @access  Customer/Vendor
export const createDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fuelOrder, deliveryAddress, scheduledTime } = req.body;
    const userId = req.user._id;

    // Get fuel order
    const fuelOrderDoc = await fuelOrderModel.findById(fuelOrder);
    if (!fuelOrderDoc) throw new AppError("Fuel order not found", StatusCodes.NOT_FOUND);

    // Create delivery
    const delivery = await deliveryModel.create({
      fuelOrder,
      driver: null,
      vendor: fuelOrderDoc.vendor,
      customer: userId,
      deliveryAddress,
      scheduledTime,
      fuelType: fuelOrderDoc.fuelType,
      quantity: fuelOrderDoc.quantity,
      unit: fuelOrderDoc.unit,
      cost: fuelOrderDoc.totalAmount,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all deliveries
// @route   GET /api/v1/deliveries
// @access  Customer/Vendor/Driver/Admin
export const getDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const role = (user.role as any).name || user.role;

    let query = {};

    if (role === "customer") {
      query = { customer: user._id };
    } else if (role === "vendor") {
      const vendor = await vendorModel.findOne({ user: user._id });
      if (vendor) query = { vendor: vendor._id };
    } else if (role === "driver") {
      const driver = await driverModel.findOne({ user: user._id });
      if (driver) query = { driver: driver._id };
    }
    // Admin sees all deliveries

    const deliveries = await deliveryModel.find(query)
      .populate("customer", "email firstName lastName")
      .populate("vendor", "businessName")
      .populate("driver", "user")
      .populate("fuelOrder")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery by ID
// @route   GET /api/v1/deliveries/:id
// @access  Customer/Vendor/Driver/Admin
export const getDeliveryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await deliveryModel.findById(req.params.id)
      .populate("customer", "email firstName lastName phone")
      .populate("vendor", "businessName")
      .populate("driver", "user")
      .populate("fuelOrder");

    if (!delivery) throw new AppError("Delivery not found", StatusCodes.NOT_FOUND);

    res.status(StatusCodes.OK).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status
// @route   PATCH /api/v1/deliveries/:id/status
// @access  Customer/Vendor/Driver/Admin
export const updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await deliveryModel.findById(req.params.id);
    if (!delivery) throw new AppError("Delivery not found", StatusCodes.NOT_FOUND);

    const { status, notes } = req.body;

    delivery.status = status || delivery.status;
    if (notes) delivery.notes = notes;

    if (status === "delivered") {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    res.status(StatusCodes.OK).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign driver to delivery
// @route   PATCH /api/v1/deliveries/:id/assign-driver
// @access  Vendor/Admin
export const assignDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await deliveryModel.findById(req.params.id);
    if (!delivery) throw new AppError("Delivery not found", StatusCodes.NOT_FOUND);

    const { driverId } = req.body;

    const driver = await driverModel.findById(driverId);
    if (!driver) throw new AppError("Driver not found", StatusCodes.NOT_FOUND);

    delivery.driver = driverId;
    delivery.status = "assigned";

    await delivery.save();

    res.status(StatusCodes.OK).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm delivery
// @route   PATCH /api/v1/deliveries/:id/confirm
// @access  Customer
export const confirmDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await deliveryModel.findById(req.params.id);
    if (!delivery) throw new AppError("Delivery not found", StatusCodes.NOT_FOUND);

    if (delivery.customer.toString() !== req.user._id.toString()) {
      throw new AppError("Not authorized to confirm this delivery", StatusCodes.FORBIDDEN);
    }

    delivery.status = "delivered";
    delivery.actualDeliveryTime = new Date();

    await delivery.save();

    res.status(StatusCodes.OK).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};