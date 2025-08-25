import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { VideoId } = req.params;
  //toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //toggle like on Comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //toggle like on Tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //get All like video
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
