import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComment = asyncHandler(async (req, res) => {
  //get all Comment for video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  //add a Comment to a video
});

const UpdateComment = asyncHandler(async (req, res) => {
  //Update a Comment to a video
});

const deleteComment = asyncHandler(async (req, res) => {
  //delete a Comment to a video
});

export { getVideoComment, addComment, UpdateComment, deleteComment };
