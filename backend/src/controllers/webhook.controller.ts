import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import nombaService from "../services/nomba.service";
import paymentRecoveryService from "../services/payment-recovery.service";
import paymentModel from "../models/Payment";
import subscriptionModel from "../models/Subscription";
import webhookLogModel from "../models/WebhookLog";
import logger from "../config/logger";

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-nomba-signature"] as string;
    const payload = req.body;

    const isValid = nombaService.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      logger.warn("Invalid webhook signature");
      return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: "Invalid signature" });
    }

    const webhookLog = await webhookLogModel.create({
      event: payload.event,
      payload,
      signature,
      receivedAt: new Date(),
    });

    await processWebhookEvent(payload);

    webhookLog.processed = true;
    webhookLog.processedAt = new Date();
    await webhookLog.save();

    res.status(StatusCodes.OK).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    next(error);
  }
};

async function processWebhookEvent(payload: any) {
  const { event, data } = payload;

  switch (event) {
    case "payment.success":
      await paymentModel.findOneAndUpdate({ nombaTransactionId: data.id }, { status: "success", processedAt: new Date() });
      break;
    case "payment.failed":
      const payment = await paymentModel.findOne({ nombaTransactionId: data.id });
      if (payment) {
        await paymentRecoveryService.handleFailedPayment(payment._id.toString(), data.failure_reason, data.failure_code);
      }
      break;
    case "subscription.paused":
      await subscriptionModel.findOneAndUpdate({ nombaSubscriptionId: data.id }, { status: "paused" });
      break;
    case "subscription.resumed":
      await subscriptionModel.findOneAndUpdate({ nombaSubscriptionId: data.id }, { status: "active" });
      break;
    case "subscription.cancelled":
      await subscriptionModel.findOneAndUpdate({ nombaSubscriptionId: data.id }, { status: "cancelled", cancelledAt: new Date() });
      break;
    case "card.expired":
      await paymentRecoveryService.handleCardExpired(data.id);
      break;
    default:
      logger.warn(`Unhandled webhook event: ${event}`);
  }
}

export const getWebhookLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await webhookLogModel.find().sort({ receivedAt: -1 }).limit(100);
    res.status(StatusCodes.OK).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getWebhookLogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await webhookLogModel.findById(req.params.id);
    if (!log) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Not found" });
    }
    res.status(StatusCodes.OK).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
