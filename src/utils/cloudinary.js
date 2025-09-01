import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodedCloudinary = async (localfilepath, resourceType = "auto") => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: resourceType,
      folder: "Youtube",
      timeout: 180000,
      use_filename: true,
      unique_filename: false,
    });

    console.log("uploaded to Cloudinary:", response.secure_url);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (fs.existsSync(localfilepath)) fs.unlinkSync(localfilepath);
    return null;
  }
};

const deleteFromclodinary = async (publicId, resourceType = "image") => {
  try {
    console.log("Deleting:", publicId, resourceType);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
      timeout: 180000,
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
