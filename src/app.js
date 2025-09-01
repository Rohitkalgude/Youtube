import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// origin → Only allows requests from the frontend domain specified in CORS_ORIGIN (from .env).
// credentials: true → Allows cookies, authorization headers, or TLS client certificates to be sent across domains.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parses incoming JSON requests.
// Limits payload size to 16 KB (to prevent large data abuse).
// Parses URL-encoded form data (application/x-www-form-urlencoded).
// extended: true → Allows nested objects in data.
// Also limited to 16 KB.
// Serves files (images, CSS, JS) from the public folder.
// Example: If you have /public/logo.png, you can access it at http://yourserver.com/logo.png.
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRoute from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/tweet", tweetRoute);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/palylists", playlistRouter);
app.use("/api/v1/dashboards", dashboardRouter);
export { app };
