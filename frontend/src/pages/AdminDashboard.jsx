
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await API.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched users:", data); 
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Logout user
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!userId) return toast.error("Invalid user ID");
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");

      const response = await API.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success(response.data.message || "User deleted successfully");
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Toggle role
  const handleToggleRole = async (userId, currentRole) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.put(`/admin/users/${userId}/role`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(prev =>
        prev.map(u => u._id === userId ? { ...u, role: data.role } : u)
      );

      toast.success(`Role updated to ${data.role}`);
    } catch (err) {
      console.error("Role update error:", err);
      toast.error("Failed to update role");
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
          {users.map((user) => {
          const role = user.role || "user";

          // Determine blog image (supports thumbnail or image, full URL or filename)
          let blogImage = "/default.png";
          let blogTitle = "No Blog";

          if (user.blogs && user.blogs.length > 0) {
            const blog = user.blogs[0];
            blogTitle = blog.title || "Untitled Blog";

            blogImage = blog.thumbnail
              ? blog.thumbnail.startsWith("http")
                ? blog.thumbnail
                : `http://localhost:5000/uploads/${blog.thumbnail}`
              : blog.image
                ? blog.image.startsWith("http")
                  ? blog.image
                  : `http://localhost:5000/uploads/${blog.image}`
                : "/default.png";
          }


          return (
            <div
              key={user._id}
              className="bg-gray-800 rounded-xl shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {/* Blog Image */}
              <div className="flex items-center mb-4">
                <img
                  src={blogImage}
                  alt={blogTitle}
                  title={blogTitle}
                  className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-indigo-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default.png";
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    role === "admin"
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {role.toUpperCase()}
                </span>
              </div>

              {/* Blogs */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Blogs:</h3>
                {user.blogs && user.blogs.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                    {user.blogs.map((blog) => (
                      <li key={blog._id}>{blog.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No blogs yet</p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleToggleRole(user._id, user.role)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  {user.role === "admin" ? "Make User" : "Make Admin"}
                </button>
              </div>

              {/* Created & Updated */}
              <div className="mt-4 text-gray-400 text-xs flex justify-between">
                <span>
                  Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                </span>
                <span>
                  Updated: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
