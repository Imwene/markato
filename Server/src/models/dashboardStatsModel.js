import { Schema, model } from "mongoose";

const dashboardStatsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    totalBookings: { type: Number, default: 0 },
    pendingBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DashboardStats = model("DashboardStats", dashboardStatsSchema);
