import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import paymentModel from "../models/Payment";
import cardModel from "../models/Card";
import nombaService from "../services/nomba.service";
import { AppError } from "../middleware/error.middleware";

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency, cardId, subscriptionId, description, metadata } = req.body;
    const userId = req.user._id;

    const card = await cardModel.findById(cardId);
    if (!card) throw new AppError("Card not found", StatusCodes.NOT_FOUND);

    const charge = await nombaService.createCharge({
      amount,
      currency: currency || "NGN",
      card: { token: card.nombaCardId },
      customer: { id: userId.toString(), email: req.user.email },
      description,
      metadata,
      subscriptionId,
    });

    const payment = await paymentModel.create({
      user: userId,
      subscription: subscriptionId,
      card: cardId,
      amount,
      currency: currency || "NGN",
      status: charge.status === "success" ? "success" : "pending",
      method: "card",
      nombaChargeId: charge.id,
      description,
      metadata,
      retryCount: 0,
      maxRetries: 3,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: { payment, charge },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chargeId } = req.params;
    const charge = await nombaService.verifyCharge(chargeId);
    res.status(StatusCodes.OK).json({ success: true, data: charge });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const payment = await paymentModel.findById(id);
    if (!payment) throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
    const refund = await nombaService.refundCharge(payment.nombaChargeId, amount);
    payment.refundAmount = amount || payment.amount;
    payment.refundReason = reason;
    await payment.save();
    res.status(StatusCodes.OK).json({ success: true, data: { payment, refund } });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentModel.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(StatusCodes.OK).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentModel.findById(req.params.id).populate("card").populate("subscription");
    if (!payment) throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
    res.status(StatusCodes.OK).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
