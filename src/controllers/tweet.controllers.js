import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.modle.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  // create tweet
  // body content validation
  // user must be logged in
  // tweet saved in DB

  const { content } = req.body;
  const ownerId = req.user?._id;

  if (!content?.trim()) {
    throw new ApiError(400, "content are required");
  }

  if (content.length > 280) {
    throw new ApiError(400, "Tweet must be under 280 characters");
  }

  if (!ownerId || !isValidObjectId(ownerId)) {
    throw new ApiError(401, "please login first");
  }

  const tweet = await Tweet.create({
    owner: ownerId,
    content,
  });

  if (!tweet) {
    throw new ApiError(400, "Something went wrong while creating tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet content successfully create"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  //get user tweet
  //show first user id show
  //userid valid or not his show

  const { userId } = req.params;

  if (!userId?.trim() || !isValidObjectId(userId)) {
    throw new ApiError(400, "invalid format");
  }

  const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

  if (!tweets.length) {
    throw new ApiError(404, "no tweet found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets are fetched successfully"));
});

const UpdateTweet = asyncHandler(async (req, res) => {
  // Update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId?.trim() || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid format");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "tweets does not exist");
  }

  if (!tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content },
    },
    { new: true }
  );

  if (!updateTweet) {
    throw new ApiError(500, "Something went wrong while updating the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "contet update successfully"));
});

const deletedTweet = asyncHandler(async (req, res) => {
  // delete tweet

  const { tweetId } = req.params;

  if (!tweetId?.trim() || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid format");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "tweet is not exist");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not authorized to delete this tweet");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet successfully delete"));
});

export { createTweet, getUserTweet, UpdateTweet, deletedTweet };
