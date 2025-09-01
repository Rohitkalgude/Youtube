import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //create playlist

  const { name, description } = req.body;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "All filed are required");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "user not found");
  }

  const createBy = await PlayList.create({
    name: name,
    description: description,
    owner: userId,
  });

  if (!createBy) {
    throw new ApiError(500, "failed to created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createBy, "palylisted successfully created"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  //get user playlist

  const { userId } = req.params;

  if (!userId?.trim() || !isValidObjectId(userId)) {
    throw new ApiError(400, "userId is required");
  }

  if (userId.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  const palyLists = await PlayList.find({
    owner: userId,
  }).populate("videos");

  if (!palyLists.length) {
    throw new ApiError(404, "palyLists not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, palyLists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //get playlist by id
  const { playlistId } = req.params;

  if (!playlistId?.trim() || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid id format");
  }

  const Palylist = await PlayList.findById(playlistId).populate("videos");

  if (!Palylist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, Palylist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  //get playlist by id
  const { playlistId, VideoId } = req.params;

  if (!playlistId?.trim() || !VideoId?.trim()) {
    throw new ApiError(400, "playlistId and VideoId is missing");
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(VideoId)) {
    throw new ApiError(400, "invalid id format");
  }

  const Playlist = await PlayList.findById(playlistId);
  if (!Playlist) {
    throw new ApiError(400, "playlistId is missing");
  }

  if (Playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "You are not authorized to add video");
  }

  const added = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: VideoId,
      },
    },
    {
      new: true,
    }
  );

  if (!added) {
    throw new ApiError(500, "Failed to add");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, added, "Video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  //remove video from playlist

  const { playlistId, VideoId } = req.params;

  if (!playlistId?.trim() || !VideoId?.trim()) {
    throw new ApiError(400, "playlistId and VideoId is missing");
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(VideoId)) {
    throw new ApiError(400, "invalid id format");
  }

  const Playlist = await PlayList.findById(playlistId);
  if (!Playlist) {
    throw new ApiError(400, "playlistId is missing");
  }

  if (Playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "You are not authorized to add video");
  }

  const removed = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: VideoId },
    },
    { new: true }
  );

  if (!removed) {
    throw new ApiError(500, "Failed to remove");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, removed, "Video delete successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  //delete playlist

  const { playlistId } = req.params;

  if (!playlistId?.trim()) {
    throw new ApiError(400, "playlistId is Invalid");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid id format");
  }

  const playList = await PlayList.findById(playlistId);
  if (!playList) {
    throw new ApiError(400, "playlist is missing");
  }

  if (playList.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "You are not authorized to add video");
  }

  await PlayList.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "delete successfully delete"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //update playlist

  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "all are required");
  }

  if (!playlistId?.trim() || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid id format");
  }

  const playlist = await PlayList.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist is not found");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "You are not authorized to add video");
  }

  const updatePlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $set: { name, description },
    },
    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(500, "Failed to update playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
