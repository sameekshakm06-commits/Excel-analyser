import express from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", (req, res) => {
  // optional: clear history in database
  // await History.deleteMany({ user: req.user._id });
  
  res.status(200).json({ message: "Logged out successfully" });
});

// Protected route - requires authentication
router.get("/me", protect, getMe);

export default router;