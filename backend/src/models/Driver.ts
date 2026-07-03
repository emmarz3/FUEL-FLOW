import { Schema, model, Document, Types } from "mongoose";

export enum DriverStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  OFF_DUTY = "off_duty",
  ON_DELIVERY = "on_delivery",
}

export interface IDriver extends Document {
  user: Types.ObjectId;
  licenseNumber: string;
  licenseExpiry: Date;
  vehicle: {
    type: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    capacity: number;
  };
  status: DriverStatus;
  rating: number;
  totalDeliveries: number;
  totalDistance: number;
  currentLocation: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  assignedDeliveries: Types.ObjectId[];
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    vehicle: {
      type: { type: String, required: true },
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      licensePlate: { type: String, required: true, unique: true },
      color: { type: String, required: true },
      capacity: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.OFF_DUTY,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    totalDistance: {
      type: Number,
      default: 0,
    },
    currentLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    assignedDeliveries: [
      {
        type: Schema.Types.ObjectId,
        ref: "Delivery",
      },
    ],
    bankDetails: {
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
driverSchema.index({ user: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ licenseNumber: 1 }, { unique: true });
driverSchema.index({ licensePlate: 1 }, { unique: true });

export default model<IDriver>("Driver", driverSchema);

