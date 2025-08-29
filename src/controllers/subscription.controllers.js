import mongoose, { isValidObjectId, Types } from "mongoose";
import { Subscription } from "../models/subscripition.modle.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO: toggle subscription like user subscriber or Unsubscriber
const toggleSubscription = asyncHandler(async (req, res) => {
  // validate channelId
  // check if user is logged in
  // prevent self-subscription
  // check if already subscribed
  // unsubscribe
  // subscribe

  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!channelId?.trim() || !isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channelId format");
  }

  if (!userId) {
    throw new ApiError(400, "User not existed");
  }

  if (channelId.toString() === userId.toString()) {
    throw new ApiError(400, "User cannot subscribe his own channel");
  }

  const existingSubscriber = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscriber) {
    await Subscription.findByIdAndDelete(existingSubscriber._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  } else {
    const newSub = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newSub, "subscriber successfully"));
  }
});

// controller to return subscriber list of a channel(all subscribe)
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  //
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!channelId.trim() || !isValidObjectId(channelId)) {
    throw new ApiError("invalid channelId format ");
  }

  if (!userId) {
    throw new ApiError("user is not exist");
  }

  if (userId.toString() !== channelId.toString()) {
    throw new ApiError(403, "Access is denied : not your channel");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: 0,
        subscriberId: "$subscriberDetails._id",
        username: "$subscriberDetails.username",
        email: "$subscriberDetails.email",
        avatar: "$subscriberDetails.avatar",
      },
    },
  ]);

  if (!subscribers.length) {
    throw new ApiError(404, "no Subscriber found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed(you how channel subscribe)
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const userId = req.user?._id;

  if (!subscriberId?.trim() || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "invalid id format");
  }

  if (!userId) {
    throw new ApiError(400, "invalid userId");
  }

  const subscriber = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: 0,
        subscriberId: "$subscriberDetails._id",
        username: "$subscriberDetails.username",
        email: "$subscriberDetails.email",
        avatar: "$subscriberDetails.avatar",
      },
    },
  ]);

  if (!subscriber?.length) {
    throw new ApiError(404, "Subscribed does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriber,
        "Channel Sbuscribed details fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
