
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const Home = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get("/blogs"); 
        setBlogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Latest Blogs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/blogs/${blog._id}`}
            className="border rounded-lg shadow hover:shadow-xl transition overflow-hidden"
          >
            {blog.thumbnail && (
              <img
                src={`http://localhost:5000${blog.thumbnail}`}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-2">
                {blog.description
                  ? blog.description
                  : blog.content.replace(/<[^>]+>/g, "").slice(0, 120) + "..."}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {blog.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-400">By {blog.author?.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
