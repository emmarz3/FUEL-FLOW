import { Schema, model, Document, Types } from "mongoose";

export enum GeneratorStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  OUT_OF_SERVICE = "out_of_service",
}

export interface IGenerator extends Document {
  serialNumber: string;
  model: string;
  manufacturer: string;
  capacityKW: number;
  fuelType: string;
  status: GeneratorStatus;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  location: Types.ObjectId;
  vendor: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const generatorSchema = new Schema<IGenerator>(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    model: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    capacityKW: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "lpg", "electric"],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GeneratorStatus),
      default: GeneratorStatus.ACTIVE,
    },
    lastMaintenanceDate: {
      type: Date,
      default: Date.now,
    },
    nextMaintenanceDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
generatorSchema.index({ serialNumber: 1 }, { unique: true });
generatorSchema.index({ vendor: 1 });
generatorSchema.index({ status: 1 });

export default model<IGenerator>("Generator", generatorSchema);