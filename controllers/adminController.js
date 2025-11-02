
import mongoose from "mongoose";
import User from "../models/User.js";
import Dataset from "../models/Dataset.js";
import asyncHandler from "express-async-handler";


 
export const getUploadStats = async (userId) => {
  try {
    const objectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const stats = await Dataset.aggregate([
      {
        $match: {
  $or: [
    { uploadedBy: { $in: userIds.map(id => id.toString()) } },
    { owner: { $in: userIds.map(id => id.toString()) } }
  ]
}

      },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          success: {
            $sum: {
              $cond: [{ $in: [{ $toLower: "$status" }, ["success","completed","done"]] }, 1, 0]

            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalUploads: 1,
          success: 1,
          failed: { $subtract: ["$totalUploads", "$success"] },
          successRate: {
            $cond: [
              { $eq: ["$totalUploads", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$success", "$totalUploads"] }, 100] }, 2] },
            ],
          },
        },
      },
    ]);

    return stats[0] || { totalUploads: 0, success: 0, failed: 0, successRate: 0 };
  } catch (error) {
    console.error("❌ getUploadStats error:", error);
    return { totalUploads: 0, success: 0, failed: 0, successRate: 0 };
  }
};


export const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const userIds = users.map(u => u._id);

    // Aggregate datasets
   const allStats = await Dataset.aggregate([
  {
    $match: {
      $or: [
        { uploadedBy: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } },
        { owner: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } }
      ]
    }
  },
  {
    $project: {
      userId: { $ifNull: ["$uploadedBy", "$owner"] }, // pick either
      status: { $ifNull: ["$status", "fail"] }
    }
  },
  {
    $group: {
      _id: "$userId",
      totalUploads: { $sum: 1 },
      success: {
        $sum: {
          $cond: [
            { $in: [{ $toLower: "$status" }, ["success", "completed", "done"]] },
            1,
            0
          ]
        }
      }
    }
  },
  {
    $project: {
      totalUploads: 1,
      success: 1,
      failed: { $subtract: ["$totalUploads", "$success"] },
      successRate: {
        $cond: [
          { $eq: ["$totalUploads", 0] },
          0,
          { $round: [{ $multiply: [{ $divide: ["$success", "$totalUploads"] }, 100] }, 2] }
        ]
      }
    }
  }
]);

    // Map stats to userId
    const statsMap = new Map();
    allStats.forEach(s => statsMap.set(s._id.toString(), s));

    // Merge stats into users
    const usersWithStats = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      roles: u.roles,
      isAdmin: u.isAdmin,
      ...(statsMap.get(u._id.toString()) || { totalUploads: 0, success: 0, failed: 0, successRate: 0 })
    }));

    res.status(200).json({ success: true, users: usersWithStats });

  } catch (err) {
    console.error("❌ Fetch users error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

 
export const makeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id)
    return res.status(400).json({ success: false, message: "You cannot change your own role" });

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.roles = ["admin"];
  user.isAdmin = true;
  await user.save();

  const uploadStats = await getUploadStats(user._id);

  res.status(200).json({
    success: true,
    message: `${user.name} is now an admin`,
    user: { _id: user._id, name: user.name, email: user.email, roles: user.roles, isAdmin: user.isAdmin, ...uploadStats },
  });
});


 
export const makeUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id)
    return res.status(400).json({ success: false, message: "You cannot change your own role" });

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.roles = ["user"];
  user.isAdmin = false;
  await user.save();

  const uploadStats = await getUploadStats(user._id);

  res.status(200).json({
    success: true,
    message: `${user.name} is now a regular user`,
    user: { _id: user._id, name: user.name, email: user.email, roles: user.roles, isAdmin: user.isAdmin, ...uploadStats },
  });
});


 
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id)
    return res.status(400).json({ success: false, message: "You cannot delete yourself" });

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });

  await Dataset.deleteMany({ $or: [{ uploadedBy: deletedUser._id }, { owner: deletedUser._id }] });

  const users = await User.find().select("-password");
  const usersWithStats = await Promise.all(
    users.map(async (u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      roles: u.roles,
      isAdmin: u.isAdmin,
      ...await getUploadStats(u._id),
    }))
  );

  res.status(200).json({ success: true, message: "User deleted successfully", users: usersWithStats });
});
