import { Router } from "express";
import {
  loginUser,
  logoutUser,
  register,
  refreshAccessToken,
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

export default router;
