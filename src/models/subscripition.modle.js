import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
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

// SubscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
