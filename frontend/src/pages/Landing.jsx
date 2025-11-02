
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function BlogLandingPage() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [recentSearches, setRecentSearches] = useState(() => {
    const stored = localStorage.getItem("recentSearches");
    return stored ? JSON.parse(stored) : [];
  });

  const blogSectionRef = useRef(null);
  const navigate = useNavigate();
const [newlyCreatedBlogs, setNewlyCreatedBlogs] = useState([]);
const newBlogFromCreate = location.state?.newBlog;

  // ------------------ Fetch Blogs ------------------
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get("/blogs");
        const blogs = res.data.map(b => ({
          ...b,
          category: b.category || "Uncategorized",
          thumbnail: b.thumbnail
            ? `http://localhost:5000/uploads/${b.thumbnail}`
            : b.image || "https://via.placeholder.com/400x300",
          author: b.author?.name || "Unknown",
        }));
        setAllBlogs(blogs);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  // ------------------ Categories ------------------
  const categories = React.useMemo(() => {
    const cats = allBlogs.map(b => b.category).filter(Boolean);
    return ["All", ...new Set(cats)];
  }, [allBlogs]);

  // ------------------ Filtered Blogs ------------------
  const filteredBlogs = allBlogs.filter(blog => {
    const matchesCategory =
      selectedCategory === "All" ||
      blog.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch = searchTerm
      ? blog.title.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  // ------------------ Recent Posts ------------------
  const recentPosts = React.useMemo(() => {
  // If a new blog was just created, show only that
  if (newBlogFromCreate) return [newBlogFromCreate];

  // Otherwise, default behavior (last 6 blogs in selected category)
  if (selectedCategory === "All") return allBlogs.slice(-2).reverse();

  return allBlogs
    .filter(blog => blog.category?.toLowerCase() === selectedCategory.toLowerCase())
    .slice(-2)
    .reverse();
}, [allBlogs, selectedCategory, newBlogFromCreate]);


  // ------------------ Handlers ------------------
  const handleCardClick = blog => setSelectedBlog(blog);
  const handleBack = () => setSelectedBlog(null);
  const handleHomeClick = () => {
    setSelectedBlog(null);
    setSelectedCategory("All");
    setSearchTerm("");
  };
  const handleRecentClick = blog => {
    setSelectedBlog(blog);
    blogSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ------------------ UI ------------------
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-gradient-to-r from-blue-500 to-purple-700 shadow-lg z-50 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <h1
            className="text-2xl font-bold mb-2 md:mb-0 text-white cursor-pointer hover:text-yellow-300 transition"
            onClick={handleHomeClick}
          >
            My Blog
          </h1>

          <div className="flex gap-3 flex-wrap justify-end">
            <button
              className="px-6 py-3 rounded-full text-white font-semibold hover:bg-white hover:text-blue-500 transition"
              onClick={handleHomeClick}
            >
              Home
            </button>
            <button
              className="px-6 py-3 rounded-full text-white font-semibold hover:bg-white hover:text-purple-500 transition"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="px-6 py-3 rounded-full text-white font-semibold hover:bg-white hover:text-pink-500 transition"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <select
              className="border rounded-full px-4 py-1"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border rounded-full px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {searchTerm && (
                <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded-md shadow-md z-50">
                  {recentSearches
                    .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((s, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => setSearchTerm(s)}
                      >
                        {s}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 p-6 pt-28">
        {/* Blog List / Details */}
        <div className="flex-1" ref={blogSectionRef}>
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">
            {selectedBlog ? "Blog Details" : `${selectedCategory.toUpperCase()} BLOGS`}
          </h2>

          <AnimatePresence mode="wait">
            {!selectedBlog ? (
              <motion.div
                key={selectedCategory + searchTerm}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {filteredBlogs.map(blog => (
                  <motion.div
                    key={blog._id}
                    layout
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
                    onClick={() => handleCardClick(blog)}
                  >
                    <img
                      src={blog.thumbnail}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{blog.title}</h3>
                      <p className="text-gray-700 mb-2">
                        {blog.description?.slice(0, 100)}...
                      </p>
                      <p className="text-sm text-gray-500">By {blog.author}</p>
                      {blog.category && (
                        <p className="text-xs text-gray-400">{blog.category}</p>
                        
                      )}
                      {/* Display tags */}
    {blog.tags && blog.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-1">
        {blog.tags.map((tag, idx) => (
          <span
            key={idx}
            className="text-[20px] bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="details"
                layout
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="bg-white rounded-xl shadow-lg overflow-hidden p-6"
              >
                <button
                  onClick={handleBack}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  ← Back
                </button>
                <motion.img
                  src={selectedBlog.thumbnail}
                  alt={selectedBlog.title}
                  className="w-full rounded-lg mb-6"
                  style={{ maxHeight: "70vh", objectFit: "cover" }}
                />
                <h2 className="text-3xl font-bold mb-4 text-gray-800">{selectedBlog.title}</h2>
                <p
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
                <p className="text-sm text-gray-500 mt-4">By {selectedBlog.author}</p>
                {selectedBlog.category && (
                  <p className="text-xs text-gray-400">{selectedBlog.category}</p>
                  
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Posts */}
        <div className="w-full md:w-80">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Posts</h2>
          <div className="flex flex-col gap-4">
            {recentPosts.map(blog => (
              <div
                key={blog._id}
                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => handleRecentClick(blog)}
              >
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h4 className="font-semibold text-sm text-gray-800">{blog.title}</h4>
                  <p className="text-gray-500 text-xs capitalize">
                    {blog.category} • By {blog.author}
                  </p>
                  {blog.tags && blog.tags.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-2">
      {blog.tags.map((tag, idx) => (
        <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {tag}
        </span>
      ))}
    </div>
  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
