import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uplodedCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromclodinary } from "../utils/cloudinary.js";
import { getPublicIdFromUrl } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforesave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Somthing went wrong while generating Referesh and access thoken"
    );
  }
};

const register = asyncHandler(async (req, res) => {
  //user details
  const { userName, email, fullName, password } = req.body;

  //validtion user
  if (
    [userName, email, fullName, password].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check user alReday exists
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }, { fullName }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with email, username, Fullname Alreday exists"
    );
  }
  console.log(req.files);

  //avatar and coverImage check upload
  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar files is required");
  }

  //upload Cloudinary avatar check
  const avatar = await uplodedCloudinary(avatarLocalpath);
  const coverImage = coverImageLocalpath
    ? await uplodedCloudinary(coverImageLocalpath)
    : null;

  if (!avatar?.secure_url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  //new user create
  const user = await User.create({
    fullName,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // fetch user without password(je filed ni Joye te nikalawu)
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) {
    throw new ApiError(500, "Something went wrong while Regsitering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "User Register SuccessFully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body - data
  const { email, userName, password } = req.body;

  //username or email check

  if (!password || (!email && !userName)) {
    throw new ApiError(400, "Email/Username and Password are required");
  }

  //find the user
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "User dose not exist");
  }

  //password check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  console.log(accessToken);
  console.log(refreshToken);

  const logginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log(logginUser);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logginUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodeToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token ");
    }

    if (incomingrefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newrefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access token refreshed sucfuuly"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message, "invalid refreshed token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.oldPassword = newPassword;
  await user.save({ validateBeforesave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user Featched Successfully"));
});

const UpdateAccount = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName, email },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, "Account Detalils updated"));
});

const UpdateUseravatar = asyncHandler(async (req, res) => {
  const avatarLocalpath = req.file?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.avatar) {
    const publicId = getPublicIdFromUrl(user.avatar);
    await deleteFromclodinary(publicId);
  }

  const avatar = await uplodedCloudinary(avatarLocalpath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const Updateuser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar?.url },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, Updateuser, "Avatar Image update successfully"));
});

const UpdateUsercoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalpath = req.file?.path;

  if (!coverImageLocalpath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.coverImage) {
    const publicId = getPublicIdFromUrl(user.coverImage);
    await deleteFromclodinary(publicId);
  }

  const coverImage = await uplodedCloudinary(coverImageLocalpath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const Updateuser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage?.url },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, Updateuser, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  if (!userName?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: { userName: userName.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribeToCount: {
          $size: "$subscribeTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribeToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel Featched successfully")
    );
});

const getWatchHistroy = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,  
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history Featched succefully"
      )
    );
});

export {
  register,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  UpdateAccount,
  UpdateUseravatar,
  UpdateUsercoverImage,
  getUserChannelProfile,
  getWatchHistroy,
};
