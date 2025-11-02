
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";


 
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  // Extract Bearer token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    // Verify token and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up user, omit password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, token failed or expired" });
  }
});


 
export const admin = (req, res, next) => {
  if (req.user && req.user.roles && Array.isArray(req.user.roles) && req.user.roles.includes("admin")) {
    return next();
  }
  res.status(403).json({ success: false, message: "Admin access only" });
};



// Admin-only middleware
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // ✅ Allow if roles array contains "admin" OR isAdmin is true
  const isAdminRole = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
  const isAdminFlag = req.user.isAdmin === true;

  if (isAdminRole || isAdminFlag) {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};