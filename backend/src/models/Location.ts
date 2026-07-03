import { Schema, model, Document, Types } from "mongoose";

export interface ILocation extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: "customer" | "vendor" | "delivery_point";
  user: Types.ObjectId;
  vendor: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "Nigeria",
    },
    zipCode: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    type: {
      type: String,
      enum: ["customer", "vendor", "delivery_point"],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
locationSchema.index({ city: 1 });
locationSchema.index({ state: 1 });
locationSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });
locationSchema.index({ user: 1 });
locationSchema.index({ vendor: 1 });

export default model<ILocation>("Location", locationSchema);