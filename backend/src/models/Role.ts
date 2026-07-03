import { Schema, model, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  permissions: string[];
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    icon: {
      type: String,
      default: "shield",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roleSchema.index({ name: 1 }, { unique: true });

// Virtuals
roleSchema.virtual("userCount", {
  ref: "User",
  localField: "_id",
  foreignField: "role",
  count: true,
});

export default model<IRole>("Role", roleSchema);

