import { Schema, model, Document } from "mongoose";

export enum WebhookEvent {
  PAYMENT_SUCCESS = "payment.success",
  PAYMENT_FAILED = "payment.failed",
  CHARGE_SUCCESS = "charge.success",
  CHARGE_FAILED = "charge.failed",
  REFUND_SUCCESS = "refund.success",
  SUBSCRIPTION_CREATED = "subscription.created",
  SUBSCRIPTION_PAUSED = "subscription.paused",
  SUBSCRIPTION_RESUMED = "subscription.resumed",
  SUBSCRIPTION_CANCELLED = "subscription.cancelled",
  CARD_EXPIRED = "card.expired",
  CARD_DECLINED = "card.declined",
  CUSTOMER_CREATED = "customer.created",
  CUSTOMER_UPDATED = "customer.updated",
}

export interface IWebhookLog extends Document {
  event: WebhookEvent;
  payload: Record<string, any>;
  signature: string;
  processed: boolean;
  processingError: string;
  retryCount: number;
  nextRetryAt: Date;
  receivedAt: Date;
  processedAt: Date;
}

const webhookLogSchema = new Schema<IWebhookLog>(
  {
    event: {
      type: String,
      enum: Object.values(WebhookEvent),
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    processingError: {
      type: String,
      default: "",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    nextRetryAt: {
      type: Date,
      default: null,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
webhookLogSchema.index({ event: 1 });
webhookLogSchema.index({ processed: 1 });
webhookLogSchema.index({ receivedAt: -1 });

export default model<IWebhookLog>("WebhookLog", webhookLogSchema);

