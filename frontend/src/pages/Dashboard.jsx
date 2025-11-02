

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProfile, logout } from "../features/authSlice";
import API from "../api/axios";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: profileLoading } = useSelector((state) => state.auth);

  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Fetch profile on mount if user is null
  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  // Fetch blogs when user becomes available
  useEffect(() => {
    const loadBlogs = async () => {
      if (!user) return;
      setLoadingBlogs(true);
      try {
        const token = localStorage.getItem("token");
        const { data: allBlogs } = await API.get("/blogs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBlogs(
          allBlogs.filter(
            (b) => b.author?._id === user._id || b.author === user._id
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    loadBlogs();
  }, [user]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/login");
  };

  // Delete blog
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(blogs.filter((b) => b._id !== id));
      alert("Blog deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete blog");
    }
  };

  // Edit blog
  const handleEdit = (blog) => navigate(`/edit/${blog._id}`);

  // Loading or not logged in
  
if (profileLoading) return <p>Loading profile...</p>;
if (!user) return <p>No user data found</p>;

if (user?.role === "admin") {
  return <AdminDashboard />;
}


  // --- USER DASHBOARD ---
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to violet-200 flex flex-col items-center p-8">
      <div className="w-full max-w-5xl bg-blue-50 shadow-2xl rounded-2xl p-8 mt-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Welcome, {user.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => navigate("/profile")}
            className="cursor-pointer bg-blue-100 hover:bg-blue-100 transition transform hover:scale-105 rounded-xl shadow-md p-6 flex flex-col items-center"
          >
            <img
              src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-Transparent-Clip-Art-PNG.png"
              className="w-20 h-20 mb-4"
            />
            <h2 className="text-lg font-semibold text-blue-700">My Profile</h2>
          </div>

          <div
            onClick={() => navigate("/create")}
            className="cursor-pointer bg-green-50 hover:bg-green-100 transition transform hover:scale-105 rounded-xl shadow-md p-6 flex flex-col items-center"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
              alt="Create Blog"
              className="w-20 h-20 mb-4"
            />
            <h2 className="text-lg font-semibold text-green-700">Create Blog</h2>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Blogs</h2>
        {blogs.length === 0 ? (
          <p className="text-gray-600">You haven't created any blogs yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="cursor-pointer bg-violet-100 hover:bg-violet-300 transition transform hover:scale-105 rounded-xl shadow-md p-6 flex flex-col items-center"
              >
                <img
                  src={
                    blog.thumbnail
                      ? blog.thumbnail.startsWith("http")
                        ? blog.thumbnail
                        : `${BACKEND_URL}/uploads/${blog.thumbnail}`
                      : ""
                  }
                  alt={blog.title}
                  className="w-full h-40 object-cover rounded"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/blogs/${blog._id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(blog)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
