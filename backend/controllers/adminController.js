import User from "../models/User.js";
import Blog from "../models/Blog.js"; // <-- ADD THIS


export const getAllUsers = async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select("_id name email role avatar createdAt updatedAt");

    // For each user, fetch their blogs including thumbnail & image
    const usersWithBlogs = await Promise.all(
      users.map(async (user) => {
        const blogs = await Blog.find({ author: user._id })
          .select("_id title thumbnail image"); // ✅ include thumbnail + image

        // Add full image URL for frontend (http://localhost:5000/uploads/filename)
        const formattedBlogs = blogs.map((b) => ({
          ...b.toObject(),
          thumbnail: b.thumbnail
            ? `${req.protocol}://${req.get("host")}/uploads/${b.thumbnail}`
            : "",
          image: b.image
            ? `${req.protocol}://${req.get("host")}/uploads/${b.image}`
            : "",
        }));

        return { ...user.toObject(), blogs: formattedBlogs };
      })
    );

    res.json(usersWithBlogs);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
};
      
    
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Toggle user role (admin <-> user)
export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.json({ _id: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
};
