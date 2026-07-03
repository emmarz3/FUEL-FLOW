import { Schema, model, Document, Types } from "mongoose";

export enum SubscriptionStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
  RECOVERING = "recovering",
}

export enum FuelType {
  PETROL = "petrol",
  DIESEL = "diesel",
  LPG = "lpg",
}

export enum SubscriptionPlan {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  CUSTOM = "custom",
}

export interface ISubscription extends Document {
  user: Types.ObjectId;
  vendor: Types.ObjectId;
  fuelType: FuelType;
  planType: SubscriptionPlan;
  amount: number;
  quantity: number;
  frequency: number;
  unit: string;
  startDate: Date;
  nextDeliveryDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  autoRenew: boolean;
  pauseReason: string;
  cancelledAt: Date;
  nombaSubscriptionId: string;
  nombaCustomerId: string;
  nombaPaymentId: string;
  savedCardId: Types.ObjectId;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    fuelType: {
      type: String,
      enum: Object.values(FuelType),
      required: true,
    },
    planType: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      enum: ["liters", "kg", "cylinders"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextDeliveryDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    pauseReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    nombaSubscriptionId: {
      type: String,
      default: "",
    },
    nombaCustomerId: {
      type: String,
      default: "",
    },
    nombaPaymentId: {
      type: String,
      default: "",
    },
    savedCardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      default: null,
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "Nigeria" },
      zipCode: { type: String, default: "" },
      coordinates: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ vendor: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1 });
subscriptionSchema.index({ nombaSubscriptionId: 1 }, { unique: true, sparse: true });

// Virtuals
subscriptionSchema.virtual("totalAmount").get(function (this: ISubscription) {
  return this.amount * this.frequency;
});

subscriptionSchema.virtual("daysUntilNextDelivery").get(function (this: ISubscription) {
  const today = new Date();
  const diffTime = this.nextDeliveryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export default model<ISubscription>("Subscription", subscriptionSchema);

