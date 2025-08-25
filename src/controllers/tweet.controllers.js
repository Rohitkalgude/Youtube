import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.modle.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  // create tweet
});

const getUserTweet = asyncHandler(async (req, res) => {
  //get user tweet
});

const UpdateTweet = asyncHandler(async (req, res) => {
  // Update tweet
});

const deletedTweet = asyncHandler(async (req, res) => {
  // delete tweet
});

export { createTweet, getUserTweet, UpdateTweet, deletedTweet };
