import { Schema, model, Document, Types } from "mongoose";

export enum DeliveryStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  EN_ROUTE = "en_route",
  AT_CUSTOMER = "at_customer",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export interface IDelivery extends Document {
  fuelOrder: Types.ObjectId;
  driver: Types.ObjectId;
  vendor: Types.ObjectId;
  customer: Types.ObjectId;
  status: DeliveryStatus;
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
  scheduledTime: Date;
  actualDeliveryTime: Date;
  fuelType: string;
  quantity: number;
  unit: string;
  cost: number;
  proofOfDelivery: string;
  notes: string;
  customerSignature: string;
  driverSignature: string;
  deliveredBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const deliverySchema = new Schema<IDelivery>(
  {
    fuelOrder: {
      type: Schema.Types.ObjectId,
      ref: "FuelOrder",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: false,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.PENDING,
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
    scheduledTime: {
      type: Date,
      required: true,
    },
    actualDeliveryTime: {
      type: Date,
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
    cost: {
      type: Number,
      required: true,
    },
    proofOfDelivery: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    customerSignature: {
      type: String,
      default: "",
    },
    driverSignature: {
      type: String,
      default: "",
    },
    deliveredBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
deliverySchema.index({ customer: 1 });
deliverySchema.index({ driver: 1 });
deliverySchema.index({ vendor: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ scheduledTime: 1 });

export default model<IDelivery>("Delivery", deliverySchema);

