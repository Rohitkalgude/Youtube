import { Router } from "express";
import {
  createTweet,
  UpdateTweet,
  deletedTweet,
  getUserTweet,
} from "../controllers/tweet.controllers.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verfiyJWT);

router.route("/createtweet").post(createTweet);
router.route("/user/:userId").get(getUserTweet);
router.route("/:tweetId").patch(UpdateTweet);
router.route("/:tweetId").delete(deletedTweet);

export default router;
