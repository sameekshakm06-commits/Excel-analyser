
import { Router } from "express";
import { getProfile, registerUser, loginUser, updateProfile} from "../controllers/authController.js";

import authMiddleware  from "../middleware/authMiddleware.js";


const router = Router();

// Get profile
router.get("/profile", authMiddleware, getProfile);



// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Update profile
router.put("/profile", authMiddleware, updateProfile);



export default router;

