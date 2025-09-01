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

router.route("/create").post(createPlaylist);
router.route("/:playlistId").patch(updatePlaylist);
router.route("/:playlistId").delete(deletePlaylist);
router.route("/:playlistId").get(getPlaylistById);
router.route("/add/:VideoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:VideoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/user/:userId").get(getUserPlaylist);

export default router;
