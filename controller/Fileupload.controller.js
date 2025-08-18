import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Upload video
export const uploadVideo = async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const videoFile = req.files.video;

    if (videoFile.mimetype !== "video/mp4") {
      return res.status(400).json({ message: "Only MP4 allowed" });
    }

    if (videoFile.size < 10 * 1024 * 1024 || videoFile.size > 50 * 1024 * 1024) {
      return res.status(400).json({ message: "File must be 10–50 MB" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "uploaded_videos",
      },
      (err, result) => {
        if (err) {
          console.error("Cloudinary error:", err);
          return res.status(500).json({ message: "Upload failed", error: err.message });
        }
        fs.unlinkSync(videoFile.tempFilePath);

        res.json({
          url: result.secure_url,
          public_id: result.public_id,
          created_at: result.created_at,
        });
      }
    );

    fs.createReadStream(videoFile.tempFilePath).pipe(stream);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


// Get all uploaded videos
export const getVideos = async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      resource_type: "video",
      prefix: "uploaded_videos/",
      max_results: 30,
    });

    const videos = resources.resources.map((video) => ({
      url: video.secure_url,
      public_id: video.public_id,
      created_at: video.created_at,
    }));

    res.json({ videos });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch videos", error: err.message });
  }
};
