
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

 
const normalizeRole = (user) => {
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles[0];
  }
  return "user";
};


 
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Please fill all fields" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  const role = normalizeRole(user);

  res.status(201).json({
    message:Loggged in successfully,
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role,       // single string role
    roles: user.roles, // keep array if needed
    token
  });
});


 
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please fill all fields" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user._id);
  const role = normalizeRole(user);

  res.status(200).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role,       // single string role
    roles: user.roles,
    token
  });
});


 
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  const role = normalizeRole(user);

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role,
      roles: user.roles
    }
  });
});


 