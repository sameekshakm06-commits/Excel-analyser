
import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleBlog } from "../features/blogSlice";

export default function BlogDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedBlog, loadingAll } = useSelector((s) => s.blogs);


  useEffect(() => {
    dispatch(fetchSingleBlog(id));
  }, [id, dispatch]);
if (loadingAll)
  return <p className="text-center mt-6 text-gray-600">Loading blog...</p>;

if (!selectedBlog)
  return <p className="text-center mt-6">Blog not found.</p>;

const blogImage = selectedBlog.thumbnail
  ? `http://localhost:5000/uploads/${selectedBlog.thumbnail}`
  : selectedBlog.image
    ? `http://localhost:5000/uploads/${selectedBlog.image}`
    : ""; // no fallback image


const relatedBlogs = selectedBlog.relatedBlogs || [];


  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Main blog content */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-4">{selectedBlog.title}</h1>
       {blogImage && (
  <img
    src={blogImage}
    alt={selectedBlog.title}
    className="w-full max-h-[500px] object-contain rounded-lg mb-4 bg-gray-200"
  />
)}

        
        <div
          className="prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
        />
        
      </div>

      {/* Sidebar: Related blogs */}
      {relatedBlogs.length > 0 && (
        <aside className="w-full md:w-80 flex-shrink-0">
          <h2 className="text-2xl font-semibold mb-4">Related Blogs</h2>
          {relatedBlogs.map((blog) => (
            <Link key={blog._id} to={`/blogs/${blog._id}`}>
              <div className="flex gap-4 mb-4 items-center bg-purple-100 p-2 rounded-lg hover:bg-gray-100 transition">
                {blog.thumbnail || blog.image ? (
                  <img
                    src={
                      blog.thumbnail
                        ? `http://localhost:5000${blog.thumbnail}`
                        : blog.image
                    }
                    alt={blog.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : null}
                <div>
                  <h4 className="font-semibold">{blog.title}</h4>
                  {blog.author && (
                    <p className="text-gray-500 text-sm">{blog.author.name}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </aside>
      )}
    </div>
  );
}
