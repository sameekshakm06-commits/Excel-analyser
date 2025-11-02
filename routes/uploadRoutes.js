

// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";

import { uploadFile, getHistory, clearHistory, getDatasetRows,
  getDatasetSummary,deleteDataset,  } from "../controllers/uploadController.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadFolder = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Only allow CSV/Excel
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".xlsx", ".xls", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only Excel/CSV files are allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Routes
router.post("/upload", protect, upload.single("file"), uploadFile);  // Upload Excel/CSV
router.get("/history", protect, getHistory);                  // Get user history
router.delete("/history", protect, clearHistory);             // Clear history (on logout)
router.get("/:id/rows", protect, getDatasetRows); // Fetch dataset rows
router.get("/:id/summary", protect, getDatasetSummary); // AI summary

// ✅ Delete dataset route
router.delete("/:id", protect, deleteDataset);


export default router;
