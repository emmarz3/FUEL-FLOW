import { Schema, model, Document, Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  REVERSED = "reversed",
}

export enum PaymentMethod {
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
  PAYMENT_LINK = "payment_link",
}

export interface IPayment extends Document {
  user: Types.ObjectId;
  subscription: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  nombaChargeId: string;
  nombaTransactionId: string;
  nombaPaymentLink: string;
  description: string;
  metadata: Record<string, any>;
  card: Types.ObjectId;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date;
  failureReason: string;
  failureCode: string;
  refundAmount: number;
  refundReason: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    nombaChargeId: {
      type: String,
      default: "",
    },
    nombaTransactionId: {
      type: String,
      default: "",
    },
    nombaPaymentLink: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    card: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    nextRetryAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: "",
    },
    failureCode: {
      type: String,
      default: "",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: "",
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
paymentSchema.index({ user: 1 });
paymentSchema.index({ subscription: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ nombaChargeId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ createdAt: -1 });

// Virtuals
paymentSchema.virtual("formattedAmount").get(function (this: IPayment) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: this.currency,
  }).format(this.amount);
});

export default model<IPayment>("Payment", paymentSchema);

