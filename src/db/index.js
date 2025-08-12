import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connctDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    console.log(`\n Mongoose connection: ${connection.connection.host}`);
  } catch (error) {
    console.log("connection FAILED", error);
    process.exit(1);
  }
};

export default connctDB;
