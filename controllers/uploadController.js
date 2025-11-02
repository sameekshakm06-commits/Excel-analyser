
import Dataset from "../models/Dataset.js";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import User from "../models/User.js"; // ✅ import User

const uploadFolder = path.join(process.cwd(), "uploads");

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = path.join(uploadFolder, req.file.filename);

    // Parse Excel/CSV
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    // Save dataset
    const dataset = await Dataset.create({
      name: req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      owner: req.user._id,
      uploadedBy: req.user._id,
      rowCount: rows.length,
      columns,
      rows,
      status: "success",
    });

    // ✅ Push dataset ID to user's uploads array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploads: dataset._id },
    });

    res.json({ message: "Upload successful", dataset });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const dataset = await Dataset.findById(id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    if (dataset.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to delete this dataset" });

    // Delete file from uploads folder
    const filePath = path.join(uploadFolder, dataset.filename);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.warn(`File already deleted or missing: ${filePath}`);
    }

    // Remove dataset from DB
    await Dataset.findByIdAndDelete(id);

    // ✅ Remove dataset ID from user's uploads array
    await User.findByIdAndUpdate(dataset.owner, {
      $pull: { uploads: dataset._id },
    });

    res.json({ message: "Dataset deleted successfully" });
  } catch (error) {
    console.error("Delete dataset error:", error);
    res.status(500).json({ message: "Failed to delete dataset" });
  }
};
export const getHistory = async (req, res) => {
  try {
    const userId = typeof req.user._id === "string" ? new mongoose.Types.ObjectId(req.user._id) : req.user._id;
    const datasets = await Dataset.find({ owner: userId }).sort({ createdAt: -1 });
    res.json(datasets);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const userDatasets = await Dataset.find({ owner: req.user._id });

    // Delete files from uploads folder
    for (const ds of userDatasets) {
      const filePath = path.join(uploadFolder, ds.filename);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.warn(`File missing or already deleted: ${filePath}`);
      }
    }

    // Remove datasets from DB
    await Dataset.deleteMany({ owner: req.user._id });

    // ✅ Clear uploads array in User
    await User.findByIdAndUpdate(req.user._id, { $set: { uploads: [] } });

    res.json({ message: "User history cleared" });
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({ message: "Failed to clear history" });
  }
};

export const getDatasetRows = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await Dataset.findById(id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    if (dataset.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Read file from disk
    const filePath = path.join(uploadFolder, dataset.filename);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    res.json({ rows });
  } catch (err) {
    console.error("Get dataset rows error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getDatasetSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await Dataset.findById(id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    const rows = dataset.rows;
    const columns = dataset.columns || [];

    if (rows.length === 0 || columns.length === 0) {
      return res.json({ summary: "Dataset is empty or has no columns." });
    }

    const summaryLines = [];

    summaryLines.push(`Dataset Name: ${dataset.name}`);
    summaryLines.push(`Total Rows: ${rows.length}`);
    summaryLines.push(`Total Columns: ${columns.length}`);
    summaryLines.push("");

    columns.forEach(col => {
      const values = rows.map(r => r[col]).filter(v => v !== null && v !== undefined);

      const numericValues = values.filter(v => typeof v === "number");
      const uniqueValues = [...new Set(values)];

      summaryLines.push(`Column: ${col}`);
      summaryLines.push(` - Total Values: ${values.length}`);
      summaryLines.push(` - Unique Values: ${uniqueValues.length}`);

      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const sum = numericValues.reduce((a,b) => a+b, 0);
        const avg = (sum / numericValues.length).toFixed(2);
        summaryLines.push(` - Min: ${min}, Max: ${max}, Avg: ${avg}`);
      } else {
        summaryLines.push(` - Sample Values: ${uniqueValues.slice(0, 5).join(", ")}`);
      }

      summaryLines.push("");
    });

    res.json({ summary: summaryLines.join("\n") });
  } catch (err) {
    console.error("Get dataset summary error:", err);
    res.status(500).json({ message: err.message });
  }
};
