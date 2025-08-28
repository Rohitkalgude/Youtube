import mongoose, { Schema, Types } from "mongoose";

const SubscriptionSchema = new mongoose(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User", // who subscribes
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User", // who channel
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
