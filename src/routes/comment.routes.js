import { Router } from "express";
import { verfiyJWT } from "../middlewares/auth.middleware";
import {
  addComment,
  getVideoComment,
  UpdateComment,
  deleteComment,
} from "../controllers/comment.controllers";
import { updateVideo } from "../controllers/video.controllers";

const router = Router();
router.use(verfiyJWT);

router.route().post(addComment);
router.route().get(getVideoComment);
router.route().patch(updateVideo);
router.route().delete(deleteComment);

export default router;
