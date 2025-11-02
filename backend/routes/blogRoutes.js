
import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getLatestBlogs,
  getUserBlogs,
  upload,
} from "../controllers/blogController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/latest", getLatestBlogs);
router.get("/", getBlogs);

router.get("/user/blogs", authMiddleware, getUserBlogs);

router.get("/:id", getBlogById);

// Private routes (authentication required + optional thumbnail upload)
router.post("/", authMiddleware, upload.single("thumbnail"), createBlog);
router.put("/:id", authMiddleware, upload.single("thumbnail"), updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);


export default router;

