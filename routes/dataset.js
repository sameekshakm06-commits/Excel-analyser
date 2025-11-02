import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import XLSX from "xlsx";
import { protect } from "../middleware/authMiddleware.js";
import Dataset from "../models/Dataset.js";

const router = express.Router();
const uploadsDir = path.join(process.cwd(), "uploads");

// Ensure uploads folder exists
fs.mkdirSync(uploadsDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const allowed = [".xlsx", ".xls", ".csv"];
  allowed.some(ext => file.originalname.toLowerCase().endsWith(ext))
    ? cb(null, true)
    : cb(new Error("Only Excel/CSV files allowed"), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// POST /upload - Upload and parse dataset
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = path.join(uploadsDir, req.file.filename);
    let workbook, jsonData;

    try {
      workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(sheet);
    } catch (err) {
      console.error("Failed to parse file:", err);
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Invalid Excel/CSV file" });
    }

    const dataset = new Dataset({
      name: req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      owner: req.user._id,
      uploadedBy: req.user._id,
      rowCount: jsonData.length,
      columns: jsonData[0] ? Object.keys(jsonData[0]) : [],
      rows: jsonData,
    });

    await dataset.save();
    res.status(201).json({ message: "File uploaded successfully", dataset });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// GET /history - Fetch user's datasets
router.get("/", protect, async (req, res) => {
  try {
    const datasets = await Dataset.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(datasets);
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// GET /:id/rows - Paginated dataset rows
router.get("/:id/rows", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit) || 100));

    const dataset = await Dataset.findById(id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    if (dataset.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    const start = (page - 1) * limit;
    const rows = dataset.rows.slice(start, start + limit);

    res.status(200).json({ rows, total: dataset.rows.length, page, limit });
  } catch (err) {
    console.error("Error fetching rows:", err);
    res.status(500).json({ message: "Internal error reading rows" });
  }
});

// DELETE /:id - Delete dataset
router.delete("/:id", protect, async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    if (dataset.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    const filePath = path.join(uploadsDir, dataset.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await dataset.remove();
    res.status(200).json({ message: "Dataset deleted", id: dataset._id });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete dataset" });
  }
});

export default router;