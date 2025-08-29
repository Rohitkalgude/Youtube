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

  if (!userId?.trim()) {
    throw new ApiError(400, "userId invalid");
  }

  const existedUser = await User.findById(userId);

  if (!existedUser) {
    throw new ApiError(404, "user not found");
  }

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;
  const sortOrder = sortType == "asc" ? 1 : -1;

  const result = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        title: { $regex: query, $options: "i" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        title: 1,
        description: 1,
        createdAt: 1,
        view: 1,
        duration: 1,
        isPublished: 1,
        thumbnail: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
    {
      $sort: {
        [sortBy]: sortOrder,
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const videos = result[0]?.data || 0;
  const totalVideos = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalVideos / limitNumber);

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      page: parseInt(page),
      totalPages,
      totalVideos,
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  //get video upload to Cloudinary, create video

  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "all are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "video files is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const videoFile = await uplodedCloudinary(videoFileLocalPath);
  const thumbnail = await uplodedCloudinary(thumbnailLocalPath);

  if (!videoFile.secure_url) {
    throw new ApiError(400, "videoFile is required");
  }

  if (!thumbnail.secure_url) {
    throw new ApiError(400, "thmbnail is required");
  }

  const video = await Video.create({
    videoFile: videoFile.secure_url,
    thumbnail: thumbnail.secure_url,
    owner: req.user._id,
    title: title.trim(),
    description: description.trim(),
    duration: videoFile?.duration || 0,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video is successfully published"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim() || isValidObjectId(videoId)) {
    throw new ApiError("invalid id format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
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

  if (!videoId?.trim() || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid id format");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video does not existed");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "all filed are required");
  }

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail files is missing");
  }

  if (video.thumbnail) {
    const publicId = getPublicIdFromUrl(video.thumbnail);
    await deleteFromclodinary(publicId);
  }

  const thumbnail = await uplodedCloudinary(thumbnailLocalPath);

  if (!thumbnail?.secure_url) {
    throw new ApiError(400, "Thumbnail is failed to upload");
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.secure_url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateVideo, "video detail update successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim() || isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid id format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "video not existed");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  if (video.videoFile) {
    const videoPublicId = getPublicIdFromUrl(video.videoFile);
    await deleteFromclodinary(videoPublicId, "video");
  }

  if (video.thumbnail) {
    const thmbnailPublicId = getPublicIdFromUrl(video.thumbnail);
    await deleteFromclodinary(thmbnailPublicId, "image");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video is delete successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is invalid");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid id format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError("404", "video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to toggle publish status");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Publish status is toggled successfully")
    );
});

const videoviewIncrement = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "video id invalid");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid id format");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { view: 1 },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video view increment successfully"));
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
