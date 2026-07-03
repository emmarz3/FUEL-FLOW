import nombaService from "./nomba.service";
import paymentModel from "../models/Payment";
import subscriptionModel from "../models/Subscription";
import cardModel from "../models/Card";
import userModel from "../models/User";
import env from "../config/env";
import logger from "../config/logger";
import redis from "../config/redis";

class PaymentRecoveryService {
  // Process failed payment and initiate retry logic
  async handleFailedPayment(paymentId: string, failureReason: string, failureCode: string): Promise<void> {
    const payment = await paymentModel.findById(paymentId);
    if (!payment) return;

    // Update payment status
    payment.status = "failed";
    payment.failureReason = failureReason;
    payment.failureCode = failureCode;
    payment.retryCount += 1;

    // Check if we should retry
    if (payment.retryCount < payment.maxRetries) {
      await this.scheduleRetry(payment);
    } else {
      // Max retries reached, suspend subscription
      await this.suspendSubscription(payment.subscription);
    }

    await payment.save();
  }

  // Schedule retry based on retry count
  async scheduleRetry(payment: any): Promise<void> {
    const retryDelays = [
      env.PAYMENT_RETRY_DELAY_1_HOURS * 60 * 60 * 1000,
      env.PAYMENT_RETRY_DELAY_2_HOURS * 60 * 60 * 1000,
    ];

    const delay = retryDelays[payment.retryCount - 1] || retryDelays[retryDelays.length - 1];
    const nextRetryAt = new Date(Date.now() + delay);

    payment.nextRetryAt = nextRetryAt;
    payment.status = "pending";
    await payment.save();

    // Add to retry queue in Redis
    await redis.zadd("payment_retry_queue", Date.now() + delay, payment._id.toString());

    logger.info(`Payment retry scheduled for ${payment._id} at ${nextRetryAt}`);
  }

  // Process subscription pause
  async handleSubscriptionPause(subscriptionId: string, reason: string): Promise<void> {
    const subscription = await subscriptionModel.findById(subscriptionId);
    if (!subscription) return;

    subscription.status = "paused";
    subscription.pauseReason = reason;
    await subscription.save();

    logger.info(`Subscription ${subscriptionId} paused: ${reason}`);
  }

  // Process subscription resume
  async handleSubscriptionResume(subscriptionId: string): Promise<void> {
    const subscription = await subscriptionModel.findById(subscriptionId);
    if (!subscription) return;

    subscription.status = "active";
    subscription.pauseReason = "";
    await subscription.save();

    logger.info(`Subscription ${subscriptionId} resumed`);
  }

  // Process subscription cancellation
  async handleSubscriptionCancel(subscriptionId: string): Promise<void> {
    const subscription = await subscriptionModel.findById(subscriptionId);
    if (!subscription) return;

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();

    logger.info(`Subscription ${subscriptionId} cancelled`);
  }

  // Handle card expiration
  async handleCardExpired(cardId: string): Promise<void> {
    const card = await cardModel.findById(cardId);
    if (!card) return;

    card.status = "expired";
    await card.save();

    // Notify user to replace card
    const user = await userModel.findById(card.user);
    if (user) {
      // Send notification to user
      logger.info(`Card expired for user ${user.email}, notifying customer`);
    }
  }

  // Handle card decline
  async handleCardDeclined(paymentId: string, declineReason: string): Promise<void> {
    const payment = await paymentModel.findById(paymentId);
    if (!payment) return;

    payment.status = "declined";
    payment.failureReason = declineReason;
    payment.retryCount += 1;

    if (payment.retryCount < payment.maxRetries) {
      await this.scheduleRetry(payment);
    }

    await payment.save();
  }

  // Suspend subscription after failed payments
  async suspendSubscription(subscriptionId: string): Promise<void> {
    const subscription = await subscriptionModel.findById(subscriptionId);
    if (!subscription) return;

    subscription.status = "suspended";
    await subscription.save();

    // Notify customer
    logger.info(`Subscription ${subscriptionId} suspended due to payment failures`);
  }

  // Resume subscription after card update
  async resumeSubscriptionAfterCardUpdate(subscriptionId: string): Promise<void> {
    const subscription = await subscriptionModel.findById(subscriptionId);
    if (!subscription) return;

    subscription.status = "active";
    await subscription.save();

    logger.info(`Subscription ${subscriptionId} resumed after card update`);
  }

  // Process retry queue (called by cron job)
  async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const dueRetries = await redis.zrangebyscore("payment_retry_queue", 0, now);

    for (const paymentId of dueRetries) {
      await this.processRetryPayment(paymentId);
      await redis.zrem("payment_retry_queue", paymentId);
    }
  }

  // Process a single retry payment
  async processRetryPayment(paymentId: string): Promise<void> {
    const payment = await paymentModel.findById(paymentId);
    if (!payment || payment.status !== "pending") return;

    try {
      // Get the card
      const card = await cardModel.findById(payment.card);
      if (!card || card.status !== "active") {
        payment.status = "failed";
        payment.failureReason = "Card not available";
        await payment.save();
        return;
      }

      // Attempt charge
      const nombaResponse = await nombaService.createCharge({
        amount: payment.amount,
        currency: payment.currency,
        card: { token: card.nombaCardId },
        customer: {
          id: payment.user.toString(),
          email: (await userModel.findById(payment.user))?.email || "",
        },
        description: payment.description,
        metadata: payment.metadata,
        subscriptionId: payment.subscription?.toString(),
      });

      if (nombaResponse.status === "success") {
        payment.status = "success";
        payment.nombaChargeId = nombaResponse.id;
        payment.processedAt = new Date();
        
        // Update subscription
        const subscription = await subscriptionModel.findById(payment.subscription);
        if (subscription) {
          subscription.nombaPaymentId = nombaResponse.id;
          await subscription.save();
        }
      } else {
        await this.handleFailedPayment(paymentId, nombaResponse.failureReason, nombaResponse.failureCode);
      }

      await payment.save();
    } catch (error) {
      logger.error(`Error processing retry payment ${paymentId}:`, error);
    }
  }

  // Notify customer of payment failure
  async notifyPaymentFailure(user: any, amount: number, retryDate: Date): Promise<void> {
    // Send email/SMS/WhatsApp notification
    logger.info(`Notifying user ${user.email} of payment failure for ${amount}`);
  }
}

export default new PaymentRecoveryService();
