import { Router } from "express";
import {
  loginUser,
  logoutUser,
  register,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  UpdateAccount,
  UpdateUseravatar,
  UpdateUsercoverImage,
  getUserChannelProfile,
  getWatchHistroy,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  register
);

router.route("/login").post(loginUser);

router.route("/logout").post(verfiyJWT, logoutUser);
router.route("/refresh-Token").post(refreshAccessToken);
router.route("/change-password").post(verfiyJWT, changeCurrentPassword);
router.route("/current-user").get(verfiyJWT, getCurrentUser);
router.route("/update-Account").patch(verfiyJWT, UpdateAccount);
router
  .route("/avatar")
  .patch(verfiyJWT, upload.single("avatar"), UpdateUseravatar);
router
  .route("/cover-image")
  .patch(verfiyJWT, upload.single("coverImage"), UpdateUsercoverImage);
router.route("/c/:userName").get(verfiyJWT, getUserChannelProfile);
router.route("/histroy").get(verfiyJWT, getWatchHistroy);

export default router;
