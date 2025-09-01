import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.modle.js";
import { Subscription } from "../models/subscripition.modle.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const { _id: channelId } = req.user;

  if (!channelId) {
    throw new ApiError(400, "channelId is invalid");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid objectId");
  }

  const totalVideos = await Video.countDocuments({ owner: channelId });
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });
  const videoIds = await Video.find({ owner: channelId }).distinct("_id");

  let totalLike = 0;
  if (videoIds.length) {
    totalLike = await Like.countDocuments({ video: { $in: videoIds } });
  }

  const viewStatus = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  const totalViews = viewStatus[0]?.totalViews || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalSubscribers,
        totalLike,
        totalViews,
      },
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const { _id: channelId } = req.user;

  if (!channelId) {
    throw new ApiError(400, "ChannelId is required");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid format id");
  }

  const videos = await Video.find({
    owner: channelId,
  }).sort({ createAt: -1 });

  if (!videos.length) {
    throw new ApiError(404, "videos not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
