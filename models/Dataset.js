
import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Dataset name is required"], 
      trim: true 
    },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "Owner is required"] 
    },
    filename: { 
      type: String, 
      required: [true, "Filename is required"] 
    }, 
    originalName: { 
      type: String,
      trim: true 
    },
    rows: { 
      type: Array, 
      default: [] 
    },
    columns: { 
      type: Array, 
      default: [] 
    },
    rowCount: { 
      type: Number, 
      default: 0,
      min: [0, "Row count cannot be negative"] 
    },
    status: { 
      type: String, 
      enum: ["success", "fail", "completed", "done"], 
      default: "fail", 
      trim: true,
      lowercase: true 
    },
    createdAt: { type: Date, default: Date.now },
    uploadedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: [true, "UploadedBy is required"]
    }
  },
  { 
    timestamps: true 
  }
);

// Pre-save hook to normalize status
datasetSchema.pre("save", function(next) {
  if (!this.status) {
    this.status = "fail";
  } else {
    this.status = this.status.trim().toLowerCase();
  }
  next();
});

// Indexes for performance
datasetSchema.index({ owner: 1 });
datasetSchema.index({ uploadedBy: 1 });

const Dataset = mongoose.model("Dataset", datasetSchema);
export default Dataset;



