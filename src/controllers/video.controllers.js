import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.modle.js";
import { User } from "../models/user.modle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uplodedCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromclodinary } from "../utils/cloudinary.js";
import { getPublicIdFromUrl } from "../utils/cloudinary.js";

const getAllvideos = asyncHandler(async (req, res) => {
  // get all videos based on query, sort, pagination

  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  //get video upload to Cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //video id find
  //video objectId find
  //video exist or not
  //video Featched
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //update video details like title,description, thumbnail
  //video id check
  //video isobjectId find
  //video find
  //video exist or not check
  //check owner video
  //videos title, description
  //videofile, thumbnail update
  //videofile url check
  //videofile and thumbnail is findByIdAndUpdate
  //videos successfully update
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //delete video
  //video id find
  //video objectId find
  //video check and his delete
  //video successfully delete
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

const videoviewIncrement = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllvideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  videoviewIncrement,
};
