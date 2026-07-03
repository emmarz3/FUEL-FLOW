import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import subscriptionModel from "../models/Subscription";
import vendorModel from "../models/Vendor";
import nombaService from "../services/nomba.service";
import { AppError } from "../middleware/error.middleware";
import env from "../config/env";

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fuelType, planType, quantity, deliveryAddress, cardId, vendorId } = req.body;
    const userId = req.user._id;

    if (!vendorId) {
      throw new AppError("Vendor ID is required", StatusCodes.BAD_REQUEST);
    }

    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) throw new AppError("Vendor not found", StatusCodes.NOT_FOUND);

    const fuelPrices = { petrol: 550, diesel: 520, lpg: 850 };
    const unit = fuelType === "lpg" ? "kg" : "liters";
    const amount = quantity * fuelPrices[fuelType];

    const subscription = await subscriptionModel.create({
      user: userId,
      vendor: vendorId,
      fuelType,
      planType,
      amount,
      quantity,
      frequency: planType === "monthly" ? 4 : 1,
      unit,
      startDate: new Date(),
      nextDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      deliveryAddress,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: { subscription, amount },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await subscriptionModel.find({ user: req.user._id });
    res.status(StatusCodes.OK).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionModel.findById(req.params.id);
    if (!subscription) throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
    res.status(StatusCodes.OK).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const pauseSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionModel.findById(req.params.id);
    if (!subscription) throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
    subscription.status = "paused";
    subscription.pauseReason = req.body.reason || "Customer requested";
    await subscription.save();
    res.status(StatusCodes.OK).json({ success: true, message: "Subscription paused", data: subscription });
  } catch (error) {
    next(error);
  }
};

export const resumeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionModel.findById(req.params.id);
    if (!subscription) throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
    subscription.status = "active";
    await subscription.save();
    res.status(StatusCodes.OK).json({ success: true, message: "Subscription resumed", data: subscription });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionModel.findById(req.params.id);
    if (!subscription) throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();
    res.status(StatusCodes.OK).json({ success: true, message: "Subscription cancelled", data: subscription });
  } catch (error) {
    next(error);
  }
};

export const upgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionModel.findById(req.params.id);
    if (!subscription) throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);

    const { planType, quantity } = req.body;
    const fuelPrices = { petrol: 550, diesel: 520, lpg: 850 };

    const unit = subscription.fuelType === "lpg" ? "kg" : "liters";
    const amount = quantity * fuelPrices[subscription.fuelType];

    subscription.planType = planType;
    subscription.quantity = quantity;
    subscription.amount = amount;
    subscription.frequency = planType === "monthly" ? 4 : 1;

    await subscription.save();

    res.status(StatusCodes.OK).json({ success: true, message: "Subscription upgraded", data: subscription });
  } catch (error) {
    next(error);
  }
};

export const downgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionModel.findById(req.params.id);
    if (!subscription) throw new AppError("Subscription not found", StatusCodes.NOT_FOUND);

    const { planType, quantity } = req.body;
    const fuelPrices = { petrol: 550, diesel: 520, lpg: 850 };

    const unit = subscription.fuelType === "lpg" ? "kg" : "liters";
    const amount = quantity * fuelPrices[subscription.fuelType];

    subscription.planType = planType;
    subscription.quantity = quantity;
    subscription.amount = amount;
    subscription.frequency = planType === "monthly" ? 4 : 1;

    await subscription.save();

    res.status(StatusCodes.OK).json({ success: true, message: "Subscription downgraded", data: subscription });
  } catch (error) {
    next(error);
  }
};
