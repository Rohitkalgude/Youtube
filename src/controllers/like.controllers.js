import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { VideoId } = req.params;
  //toggle like on video

  if (!VideoId?.trim() || !isValidObjectId(VideoId)) {
    throw new ApiError(400, "invalid id");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const existLikedVideo = await Like.findOne({
    video: VideoId,
    likeBy: userId,
  });

  if (!existLikedVideo) {
    await Like.findByIdAndDelete(existLikedVideo._id);
    return res
      .status(200)
      .json(new ApiResponse(), (200, {}, "video Unlike successfully"));
  } else {
    const like = await Like.create({
      video: VideoId,
      likeBy: userId,
    });

    if (!like) {
      throw new ApiError(500, "Failed to like");
    }
    return res
      .status(200)
      .json(new ApiResponse(), (200, like, "video like successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //toggle like on Comment

  if (!commentId?.trim() || !isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid id format");
  }

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(404, "userId not found");
  }

  const existedCommentLike = await Like.findOne({
    comment: commentId,
    likeBy: userId,
  });

  if (!existedCommentLike) {
    await Like.findByIdAndDelete(existedCommentLike._id);
    return res.status(200).json(new ApiResponse(200, "dislike comment"));
  } else {
    const comment = await Like.create({
      comment: commentId,
      likeBy: userId,
    });

    if (!comment) {
      throw new ApiError(400, "Failed to comment");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "dislike comment"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //toggle like on Tweet

  if (!tweetId?.trim() || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid id fromat");
  }

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const existedTweetLike = await Like.findOne({
    tweet: tweetId,
    likeBy: userId,
  });

  if (!existedTweetLike) {
    await Like.findByIdAndDelete(existedTweetLike._id);
    return res
      .status(200)
      .json(new ApiResponse(), (200, {}, "tweet unlike successfully"));
  } else {
    const tweet = await Like.create({
      tweet: tweetId,
      likeBy: userId,
    });

    if (!tweet) {
      throw new ApiError(400, "failed to like");
    }

    return res
      .status(200)
      .json(new ApiResponse(), (200, {}, "tweet like successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //get All like video
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
