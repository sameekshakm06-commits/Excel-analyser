
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email"], // Basic email validation
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [3, "Password should be at least 3 characters"],
  },
  roles: {
    type: [String],
    enum: ["user", "admin"],
    default: ["user"],
  },
  filesUploaded: {
    type: Number,
    default: 0,
    min: [0, "Files uploaded cannot be negative"],
  },
  // models/User.js
uploads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dataset" }],
isAdmin: { type: Boolean, default: false },

  successRate: {
    type: Number,
    default: 0,
    min: [0, "Success rate cannot be negative"],
    max: [100, "Success rate cannot exceed 100"],
  },
},
{
  timestamps: true,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
