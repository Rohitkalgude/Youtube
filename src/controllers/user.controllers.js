import { User } from "../models/user.modle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uplodedCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const register = asyncHandler(async (req, res) => {
  //user details
  const { userName, email, fullName, password } = req.body;
  console.log("username", userName);

  //validtion user
  if (
    [userName, email, fullName, password].some(
      (fields) => fields?.trim() === ""
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

  //avatar and coverImage check upload
  const avatarLocalpath = req.files?.avatar[0]?.path;
  const coverImageLocalpath = req.files?.coverImage[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar files is required");
  }

  //upload Cloudinary avatar check
  const avatar = await uplodedCloudinary(avatarLocalpath);
  const coverImage = await uplodedCloudinary(coverImageLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Avatar files is required");
  }

  //new user create
  const user = User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.ToLowerCase(),
  });

  //user create or not his check
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) {
    throw new ApiError(500, "Something went wrong while Regsitering the user");
  }

  return res.status(201).json(
    new ApiResponse(200, createUser, "User Register SuccessFully")
  )
});

export { register };
