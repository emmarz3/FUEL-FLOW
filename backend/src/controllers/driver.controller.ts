import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import driverModel from "../models/Driver";
import deliveryModel from "../models/Delivery";
import { AppError } from "../middleware/error.middleware";

// @desc    Get assigned deliveries
// @route   GET /api/v1/drivers/deliveries
// @access  Driver
export const getAssignedDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await driverModel.findOne({ user: req.user._id });
    if (!driver) throw new AppError("Driver not found", StatusCodes.NOT_FOUND);

    const deliveries = await deliveryModel.find({ driver: driver._id })
      .populate("customer", "email firstName lastName phone")
      .populate("vendor", "businessName")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery history
// @route   GET /api/v1/drivers/history
// @access  Driver
export const getDeliveryHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await driverModel.findOne({ user: req.user._id });
    if (!driver) throw new AppError("Driver not found", StatusCodes.NOT_FOUND);

    const history = await deliveryModel.find({ driver: driver._id })
      .populate("customer", "email firstName lastName")
      .populate("vendor", "businessName")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status
// @route   PATCH /api/v1/drivers/deliveries/:id/status
// @access  Driver
export const updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await driverModel.findOne({ user: req.user._id });
    if (!driver) throw new AppError("Driver not found", StatusCodes.NOT_FOUND);

    const delivery = await deliveryModel.findOne({
      driver: driver._id,
      _id: req.params.id,
    });

    if (!delivery) throw new AppError("Delivery not found", StatusCodes.NOT_FOUND);

    const { status, proofOfDelivery } = req.body;

    delivery.status = status || delivery.status;
    if (proofOfDelivery) delivery.proofOfDelivery = proofOfDelivery;
    if (status === "delivered") delivery.actualDeliveryTime = new Date();

    await delivery.save();

    // Update driver stats
    if (status === "delivered") {
      driver.totalDeliveries += 1;
      await driver.save();
    }

    res.status(StatusCodes.OK).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

// @desc    Update location
// @route   PATCH /api/v1/drivers/location
// @access  Driver
export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await driverModel.findOne({ user: req.user._id });
    if (!driver) throw new AppError("Driver not found", StatusCodes.NOT_FOUND);

    const { latitude, longitude } = req.body;

    driver.currentLocation = {
      latitude,
      longitude,
      updatedAt: new Date(),
    };

    await driver.save();

    res.status(StatusCodes.OK).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};