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

router.route("/:videoId").get(getVideoComment).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(UpdateComment);

export default router;
