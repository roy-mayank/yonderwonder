const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Create uploads and processed directories if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const processedDir = path.join(__dirname, "processed");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Attempting to save file to:", uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      uniqueSuffix + "-" + file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
}).single("image");

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.post("/process-image", (req, res) => {
  console.log("Received process-image request");

  upload(req, res, async function (err) {
    if (!req.file) {
      console.error("No file provided");
      return res.status(400).json({
        error: true,
        message: "No file provided",
      });
    }

    console.log("File uploaded successfully:", req.file);

    try {
      const processedFilename = `processed-${req.file.filename}`;
      const processedFilePath = path.join(processedDir, processedFilename);

      console.log("Processing image to:", processedFilePath);

      await sharp(req.file.path).grayscale().toFile(processedFilePath);

      console.log("Image processed successfully");

      res.json({
        success: true,
        message: "File processed successfully",
        original: `/uploads/${req.file.filename}`,
        processed: `/processed/${processedFilename}`,
      });
    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({
        error: true,
        message: `Processing error: ${error.message}`,
      });
    }
  });
});

app.use("/uploads", express.static(uploadsDir));
app.use("/processed", express.static(processedDir));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${uploadsDir}`);
  console.log(`Processed directory: ${processedDir}`);
});
