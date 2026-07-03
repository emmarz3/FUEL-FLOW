import { Schema, model, Document, Types } from "mongoose";

export enum AnalyticsType {
  USER_GROWTH = "user_growth",
  REVENUE = "revenue",
  ENGAGEMENT = "engagement",
  PERFORMANCE = "performance",
}

export interface IAnalytics extends Document {
  type: AnalyticsType;
  date: Date;
  value: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    type: {
      type: String,
      enum: Object.values(AnalyticsType),
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
analyticsSchema.index({ type: 1, date: -1 });
analyticsSchema.index({ date: -1 });

export default model<IAnalytics>("Analytics", analyticsSchema);