import { Schema, model, Document, Types } from "mongoose";

export enum FuelOrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export interface IFuelOrder extends Document {
  customer: Types.ObjectId;
  vendor: Types.ObjectId;
  driver: Types.ObjectId;
  fuelType: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  status: FuelOrderStatus;
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
  scheduledDeliveryTime: Date;
  actualDeliveryTime: Date;
  payment: Types.ObjectId;
  notes: string;
  emergencyOrder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fuelOrderSchema = new Schema<IFuelOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "lpg"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["liters", "kg", "cylinders"],
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FuelOrderStatus),
      default: FuelOrderStatus.PENDING,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "Nigeria" },
      zipCode: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
      },
    },
    scheduledDeliveryTime: {
      type: Date,
      required: true,
    },
    actualDeliveryTime: {
      type: Date,
      default: null,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    emergencyOrder: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
fuelOrderSchema.index({ customer: 1 });
fuelOrderSchema.index({ vendor: 1 });
fuelOrderSchema.index({ driver: 1 });
fuelOrderSchema.index({ status: 1 });
fuelOrderSchema.index({ createdAt: -1 });

export default model<IFuelOrder>("FuelOrder", fuelOrderSchema);

