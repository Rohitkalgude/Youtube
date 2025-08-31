import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verfiyJWT);

router.route("/c/:channelId").post(toggleSubscription);
router.route("/").get(getSubscribedChannels);
router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
