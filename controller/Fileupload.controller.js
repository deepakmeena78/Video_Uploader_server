import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// export const uploadVideo = async (req, res) => {
//   try {
//     if (!req.files || !req.files.video) {
//       return res.status(400).json({ message: "No video uploaded" });
//     }

//     const videoFile = req.files.video;

//     if (!videoFile.mimetype.startsWith("video/")) {
//       return res.status(400).json({ message: "Only video files are allowed" });
//     }

//     if (videoFile.size < 20 * 1024 * 1024 || videoFile.size > 100 * 1024 * 1024) {
//       return res.status(400).json({ message: "File must be 20–100 MB" });
//     }

//     const stream = cloudinary.uploader.upload_stream(
//       {
//         resource_type: "video",
//         folder: "uploaded_videos",
//       },
//       (err, result) => {
//         if (err) {
//           console.error("Cloudinary error:", err);
//           return res.status(500).json({ message: "Upload failed", error: err.message });
//         }

//         if (videoFile.tempFilePath && fs.existsSync(videoFile.tempFilePath)) {
//           fs.unlinkSync(videoFile.tempFilePath);
//         }

//         return res.json({
//           url: result.secure_url,
//           public_id: result.public_id,
//           created_at: result.created_at,
//           format: result.format,
//           duration: result.duration,
//         });
//       }
//     );

//     fs.createReadStream(videoFile.tempFilePath).pipe(stream);
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ message: "Upload failed", error: err.message });
//   }
// };


export const uploadVideo = async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const videoFile = req.files.video;

    if (!videoFile.mimetype.startsWith("video/")) {
      return res.status(400).json({ message: "Only video files are allowed" });
    }

    if (videoFile.size > 200 * 1024 * 1024) {
      return res.status(400).json({ message: "File must be under 200 MB" });
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

        if (videoFile.tempFilePath && fs.existsSync(videoFile.tempFilePath)) {
          fs.unlinkSync(videoFile.tempFilePath);
        }

        return res.json({
          url: result.secure_url,
          public_id: result.public_id,
          created_at: result.created_at,
          format: result.format,
          duration: result.duration,
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
