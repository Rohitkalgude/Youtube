import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllvideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  videoviewIncrement,
} from "../controllers/video.controllers.js";

const router = Router();
router.use(verfiyJWT);

router.route("/").get(getAllvideos);
router.route("/publish").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);
router.route("/:videoId").delete(deleteVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
router.route("/view/:videoId").patch(videoviewIncrement);

export default router;
