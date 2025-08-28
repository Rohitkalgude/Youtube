import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = asyncHandler(async (req, res) => {
  // build a healthCheck response that simply returns the ok  status as json with a message

  return res.status(200).json(new ApiResponse(200, {}, "Everything is good"));
});

export { healthCheck };
