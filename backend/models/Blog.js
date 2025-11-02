
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    content: { type: String, required: true }, 
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     authorName: { type: String }, 
    thumbnail: { type: String }, 
     image: {
      type: String,
      default: "",
    },
    tags: [{ type: String }],  
    slug: { type: String, unique: true, lowercase: true }, 
     category: { type: String, default: "Uncategorized" }, 
  },
  { timestamps: true }
);

// Middleware to auto-generate slug from title before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

export default mongoose.model("Blog", blogSchema);

