import dotenv from "dotenv";

import connctDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connctDB();

// import express from "express";
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("error");
//       throw err;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listing port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("error", error);
//     throw err;
//   }
// })();
