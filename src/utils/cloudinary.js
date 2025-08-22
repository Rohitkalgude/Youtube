import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodedCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
      folder: "Youtube",
    });

    console.log("upload clodinary", response.url);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath);
    return null;
  }
};

const deleteFromclodinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error, "Error deleting file from Cloudinary:");
  }
};

export { uplodedCloudinary, deleteFromclodinary };
