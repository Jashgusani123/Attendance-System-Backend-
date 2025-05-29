import { v2 as cloudinary } from 'cloudinary';

export const UploadToCloudinary = async (file: Express.Multer.File): Promise<string | false> => {
  if (!file) return "File not Founded !!";

  const base64 = file.buffer.toString("base64");
  const dataURI = `data:${file.mimetype};base64,${base64}`;

  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "AttedanceSystem",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return false;
  }
};
