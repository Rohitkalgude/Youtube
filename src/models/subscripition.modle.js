import mongoose, { Schema, Types } from "mongoose";

const SubscriptionSchema = new mongoose(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
