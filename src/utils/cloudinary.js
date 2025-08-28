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
      timeout: 600000,
    });

    console.log("upload clodinary", response.url);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath);
    return null;
  }
};

const deleteFromclodinary = async (publicId, resourceType = "image") => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
  }
};

const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const fileNameWithExt = parts[parts.length - 1];
    const folderName = parts[parts.length - 2];

    return `${folderName}/${fileNameWithExt.split(".")[0]}`;
  } catch (error) {
    console.error("Error extracting publicId:", error);
    return null;
  }
};

export { uplodedCloudinary, deleteFromclodinary, getPublicIdFromUrl };
