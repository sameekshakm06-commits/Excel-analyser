
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../features/blogSlice"; 
import QuillEditor from "../components/QuillEditor";

const CreateBlog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
    category:"",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
const [newlyCreatedBlogs, setNewlyCreatedBlogs] = useState([]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must login first");
      navigate("/login");
      setLoading(false);
      return;
    }

    if (!form.content || form.content === "<p><br></p>") {
      alert("Content cannot be empty");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("content", form.content);
      formData.append("tags", form.tags);
      formData.append("category",form.category);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await dispatch(createBlog(formData)).unwrap();
setNewlyCreatedBlogs(prev => [data, ...prev]);
      alert("Blog created successfully!");
      setForm({ title: "", description: "", content: "", tags: "",category:"" });
      setThumbnail(null);
      setPreview(null);

      navigate("/dashboard");
      console.error(err);
      alert(err?.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-gradient-to-r from-green-100 to-purple-100 p-6 rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Create Blog</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="description"
          placeholder="Short description"
          value={form.description}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <QuillEditor
          value={form.content}
          onChange={(value) => setForm({ ...form, content: value })}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="p-2 border rounded"
        />
        {preview && (
          <img
            src={preview}
            alt="Thumbnail Preview"
            className="w-48 mt-2 mb-2 rounded border"
          />
        )}
{/* Category dropdown */}
  <select
    name="category"
    value={form.category}
    
    onChange={handleChange}
    required
    className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
     <option value="" disabled hidden>
    Select Category
  </option>
    <option value="Technology">Technology</option>
    <option value="Cooking">Cooking</option>
    <option value="Gym">Gym</option>
        <option value="Nature">Nature</option>
        <option value="">Uncategorized</option>
    

  </select>
        <button
          type="submit"
          disabled={loading}
          className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Creating..." : "Create Blog"}
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;

