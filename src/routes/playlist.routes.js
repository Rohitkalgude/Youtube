import { Router } from "express";
import {
  createPlaylist,
  getPlaylistById,
  getUserPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verfiyJWT);

router.route("/").post(createPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylist);

export default router;
