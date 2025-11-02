
import Blog from "../models/Blog.js";
import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";

// -------------------- Ensure uploads folder exists --------------------
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// -------------------- Multer setup --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });


// -------------------- Create Blog --------------------
export const createBlog = asyncHandler(async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const { title, description, content, tags, image,category } = req.body;

    if (!title || !content || content === "<p><br></p>") {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const thumbnail = req.file ? req.file.filename : null;

    const tagsArray = tags
      ? Array.isArray(tags)
        ? tags.map((t) => t.trim())
        : tags.split(",").map((t) => t.trim())
      : [];

    const newBlog = await Blog.create({
      title,
      description: description || "",
      content,
      image: image || "",
      thumbnail,
      author: req.user._id,
      authorName: req.user.name, // ✅ add author name
      tags: tagsArray,
        category: category || "Uncategorized", // ✅ use category
    });

    res.status(201).json(newBlog);
  } catch (error) {
    console.error("CREATE BLOG ERROR:", error);
    res
      .status(500)
      .json({ message: "Server error while creating blog", error: error.message });
  }
});


// -------------------- Get All Blogs --------------------
export const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().populate("author", "name email");
  res.json(blogs);
});

// -------------------- Get Latest Blogs --------------------
export const getLatestBlogs = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const latestBlogs = await Blog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", "name email");
  res.json(latestBlogs);
});

// -------------------- Get Single Blog --------------------
export const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  const blog = await Blog.findById(id).populate("author", "name email");
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  res.json(blog);
});


// -------------------- Get Blogs by Logged-in User --------------------
export const getUserBlogs = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  const blogs = await Blog.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .populate("author", "name email");

  if (!blogs || blogs.length === 0) {
    return res.status(404).json({ message: "No blogs found for this user" });
  }

  res.json(blogs);
});

// -------------------- Update Blog --------------------
export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, description, tags, image } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  // Only author can update
  if (req.user._id.toString() !== blog.author.toString()) {
    return res.status(403).json({ message: "Not authorized to update this blog" });
  }

  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.description = description || blog.description;
  blog.tags = tags ? tags.split(",").map((t) => t.trim()) : blog.tags;
  blog.image = image || blog.image;

  if (req.file) {
    blog.thumbnail = req.file.filename;
  }

  const updatedBlog = await blog.save();
  res.json(updatedBlog);
});

// -------------------- Delete Blog --------------------
export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  if (req.user._id.toString() !== blog.author.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this blog" });
  }

  await blog.deleteOne();
  res.json({ message: "Blog deleted successfully" });
});

