import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User", // jo subscribe karta hai
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User", // jiska channel hai
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
