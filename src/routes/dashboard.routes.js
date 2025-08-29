import { Router } from "express";
import { verfiyJWT } from "../middlewares/auth.middleware.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers.js";

const router = Router();
router.use(verfiyJWT);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
