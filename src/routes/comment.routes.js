import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComment,
  UpdateComment,
} from "../controllers/comment.controllers.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verfiyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").post(addComment);
router.route("/:videoId").get(getVideoComment);
router.route("/c/:commentId").delete(deleteComment);
router.route("/c/:commentId").patch(UpdateComment);
export default router;
