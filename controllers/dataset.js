import Dataset from "../models/Dataset.js";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");


 
export const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;

    // Find dataset in MongoDB
    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: "Dataset not found" });
    }

    // Only allow owner to delete
    if (dataset.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Delete file from uploads folder
    const filePath = path.join(uploadsDir, dataset.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove dataset record from MongoDB
    await dataset.remove();

    return res.status(200).json({
      success: true,
      message: `Dataset ${dataset.name} deleted successfully`,
      id: dataset._id,
    });
  } catch (err) {
    console.error("Delete dataset error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during deletion" });
  }
};
