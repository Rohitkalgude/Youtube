import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComment = asyncHandler(async (req, res) => {
  //get all Comment for video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId?.trim() !== !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid id format");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const commentAggregate = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        metaData: [{ $count: "total" }],
        data: [
          {
            $skip: skip,
          },
          {
            $limit: Number(limit),
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
              _id: 1,
              content: 1,
              createdAt: 1,
              updateAt: 1,
              "owner._id": 1,
              "owner.username": 1,
              "owner.avatar": 1,
            },
          },
        ],
      },
    },
  ]);

  const total = commentAggregate[0]?.metaData[0]?.total || 0;
  const comments = commentAggregate[0]?.data || [];

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalCount: total,
        currentpage: Number(page),
        totalpage: Math.ceil(total / limit),
        comments,
      },

      "Comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  //add a Comment to a video

  const { content } = req.body;
  const { videoId } = req.params;

  if (!videoId?.trim() || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid id fromat");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "content is required");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(404, "please login first");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(500, "Something went wrong while creating comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "commeent added successfully"));
});

const UpdateComment = asyncHandler(async (req, res) => {
  //Update a Comment to a video
  const { content } = req.body;
  const { commentId } = req.params;

  if (!content || !commentId) {
    throw new ApiError(400, "All is required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid id format");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content: content } },
    { new: true }
  );

  if (!updateComment) {
    throw new ApiError(500, "failed to upadte");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "comment update successfulliy"));
});

const deleteComment = asyncHandler(async (req, res) => {
  //delete a Comment to a video
  const { commentId } = req.params;

  if (!commentId?.trim() || !isValidObjectId(commentId)) {
    throw new ApiError("invalid format");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment delete successfully"));
});

export { getVideoComment, addComment, UpdateComment, deleteComment };
