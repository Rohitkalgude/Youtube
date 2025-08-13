import dotenv from "dotenv";
import connctDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connctDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port: ${process.env.PORT} `);
    });
  })

  .catch((error) => {
    console.log("Monogo connection failed");
  });
