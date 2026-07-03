import { Schema, model, Document, Types } from "mongoose";

export enum VendorStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
}

export interface IVendor extends Document {
  user: Types.ObjectId;
  businessName: string;
  businessRegistrationNumber: string;
  taxId: string;
  description: string;
  status: VendorStatus;
  rating: number;
  totalDeliveries: number;
  totalRevenue: number;
  fuelTypes: string[];
  serviceAreas: Types.ObjectId[];
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
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
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  inventory: Array<{
    fuelType: string;
    quantity: number;
    unit: string;
    lastUpdated: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessRegistrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    taxId: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(VendorStatus),
      default: VendorStatus.PENDING_VERIFICATION,
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
    totalRevenue: {
      type: Number,
      default: 0,
    },
    fuelTypes: {
      type: [String],
      enum: ["petrol", "diesel", "lpg"],
      default: ["petrol", "diesel"],
    },
    serviceAreas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
    contactPerson: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    address: {
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
    bankDetails: {
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
    },
    inventory: [
      {
        fuelType: { type: String, enum: ["petrol", "diesel", "lpg"], required: true },
        quantity: { type: Number, default: 0 },
        unit: { type: String, default: "liters" },
        lastUpdated: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
vendorSchema.index({ user: 1 });
vendorSchema.index({ businessName: 1 });
vendorSchema.index({ status: 1 });

export default model<IVendor>("Vendor", vendorSchema);

