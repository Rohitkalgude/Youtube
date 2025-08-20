import { User } from "../models/user.modle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uplodedCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { use } from "react";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken;
    const refreshToken = user.generateRefreshToken;

    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforesave: false });

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
  if (!(userName || email)) {
    throw new ApiError("404", "Username or email is required ");
  }

  //find the user
  const user = await User.findOne({
    $or: [{ userName }, { email }],
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

  const logginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

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
    .clearCookies("accessToken", options)
    .clearCookies("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout"));
});

export { register, loginUser, logoutUser };
