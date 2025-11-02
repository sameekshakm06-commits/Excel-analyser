// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import datasetRoutes from "./routes/dataset.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";



import fs from "fs";

dotenv.config();
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI);

const app = express();

app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ensure upload dir exists
app.use("/uploads", express.static(path.join(path.resolve(), "/uploads")));


// routes
app.use("/api/auth", authRoutes);


app.use("/api/uploads", uploadRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/uploads", datasetRoutes);



app.get("/", (req, res) => res.send("Excel Analytics Backend is running"));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ message: err.message });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
