import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      description: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const playList = mongoose.model("playlist", playlistSchema);
