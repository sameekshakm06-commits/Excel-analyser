
import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import { getAllUsers, deleteUser, toggleUserRole } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Only allow admins to access these routes
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.put("/users/:id/role", protect, adminOnly, toggleUserRole);

export default router;
