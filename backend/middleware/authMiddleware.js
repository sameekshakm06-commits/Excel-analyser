
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // select only the fields needed by frontend
    const user = await User.findById(decoded.id).select(
      "_id name email role avatar createdAt updatedAt"
    );

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // now includes role
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
//  Verify token
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "User not found" });

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};


export default authMiddleware;
