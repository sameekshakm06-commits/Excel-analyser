

import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUsers, makeAdmin, makeUser, deleteUser } from "../controllers/adminController.js";

const router = express.Router();

// Get all users with stats
router.get("/users", protect, adminOnly, getUsers);

// Promote user to admin
router.put("/users/make-admin/:id", protect, adminOnly, makeAdmin);

// Demote admin to regular user
router.put("/users/make-user/:id", protect, adminOnly, makeUser);

// Delete a user
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
