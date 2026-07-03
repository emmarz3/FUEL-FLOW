import { Schema, model, Document, Types } from "mongoose";

export enum CardStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  DECLINED = "declined",
  SUSPENDED = "suspended",
  REVOKED = "revoked",
}

export interface ICard extends Document {
  user: Types.ObjectId;
  nombaCardId: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  status: CardStatus;
  isDefault: boolean;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
  usedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nombaCardId: {
      type: String,
      required: true,
      unique: true,
    },
    brand: {
      type: String,
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    expiryMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    expiryYear: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CardStatus),
      default: CardStatus.ACTIVE,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    billingAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "Nigeria" },
      zipCode: { type: String, default: "" },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
cardSchema.index({ user: 1 });
cardSchema.index({ nombaCardId: 1 }, { unique: true });
cardSchema.index({ isDefault: 1 });

// Virtuals
cardSchema.virtual("displayName").get(function (this: ICard) {
  return `${this.brand} •••• ${this.last4}`;
});

cardSchema.virtual("isExpired").get(function (this: ICard) {
  const now = new Date();
  const expiry = new Date(this.expiryYear, this.expiryMonth - 1, 0);
  return expiry < now;
});

cardSchema.virtual("expiryDate").get(function (this: ICard) {
  return `${this.expiryMonth.toString().padStart(2, "0")}/${this.expiryYear}`;
});

// Middleware to set usedAt on update
cardSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default model<ICard>("Card", cardSchema);

