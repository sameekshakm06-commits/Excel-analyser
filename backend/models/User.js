// backend/models/User.js
import { Schema, model } from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";

const userSchema = new Schema(
  {
    name: { type: String, 
      required: true },
    email: { type: String, 
      required:[ true, "email required"],
      unique: true },
    password: { type: String, required: true },
     blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
     

   role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", 
    },
  },
  

  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};

export default model("User", userSchema);
