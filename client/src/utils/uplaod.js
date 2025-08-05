import axios from "axios";

const upload = async (file, type = "image") => {
  if (!file) {
    console.log("No file provided for upload");
    return null;
  }
  
  console.log("Starting upload for file:", file.name, "type:", type);
  
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "fiverr"); // make sure this exists in Cloudinary

  try {
    console.log("Uploading to Cloudinary...");
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/duephjbes/${type}/upload`,
      data,
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    console.log("Upload successful:", res.data.secure_url);
    return res.data.secure_url; // Cloudinary returns the URL here
  } catch (err) {
    console.error("Upload error details:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw new Error(`Upload failed: ${err.message}`);
  }
};

export default upload;
