import { Schema, model, Document, Types } from "mongoose";

export enum BusinessStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface IBusiness extends Document {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  status: BusinessStatus;
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
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(BusinessStatus),
      default: BusinessStatus.ACTIVE,
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
businessSchema.index({ name: 1 });
businessSchema.index({ email: 1 }, { unique: true });
businessSchema.index({ owner: 1 });

export default model<IBusiness>("Business", businessSchema);