import { Schema, model, Document, Types } from "mongoose";

export enum NotificationType {
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  DELIVERY_UPDATE = "delivery_update",
  SUBSCRIPTION_CHANGE = "subscription_change",
  CARD_EXPIRATION = "card_expiration",
  SYSTEM = "system",
}

export interface INotification extends Document {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  channel: ("email" | "sms" | "whatsapp" | "push")[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    channel: {
      type: [String],
      enum: ["email", "sms", "whatsapp", "push"],
      default: ["push"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export default model<INotification>("Notification", notificationSchema);