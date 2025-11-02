

  import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation,useNavigate } from "react-router-dom";
import API from "../api/axios";
import QuillEditor from "../components/QuillEditor";

const EditBlog = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();


  // Callback passed from Dashboard to update blog card
  const onUpdate = location.state?.onUpdate;

  const quillRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
    category:"",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await API.get(`/blogs/${id}`);
        setForm({
          title: data.title,
          description: data.description || "",
          content: data.content || "",
          tags: data.tags ? data.tags.join(", ") : "",
          category: data.category || "", 
        });
        setExistingThumbnail(data.thumbnail || null);
      } catch (err) {
        console.error("Fetch blog error:", err);
        alert("Failed to fetch blog");
      }
    };
    fetchBlog();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle thumbnail change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setThumbnail(e.target.files[0]);
  };

  // Handle submit
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("content", form.content);
    formData.append("tags", form.tags);
    formData.append("category", form.category);

    if (thumbnail) formData.append("thumbnail", thumbnail);

    const { data } = await API.put(`/blogs/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (onUpdate) onUpdate(data);

    alert("Blog updated successfully!");
    navigate("/dashboard"); 
  } catch (err) {
    console.error("Update blog error:", err.response?.data || err);
    alert(err?.response?.data?.message || "Failed to update blog");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-gradient-to-r from-yellow-100 to-pink-100 p-6 rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
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
          ref={quillRef}
          value={form.content}
          onChange={(value) => setForm({ ...form, content: value })}
          className="h-64 mb-2"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="p-2 border rounded"
        />
        {/* Category dropdown */}
  <select
    name="category"
    value={form.category}
    onChange={handleChange}
    required
    className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
   
    <option value="Technology">Technology</option>
    <option value="Cooking">Cooking</option>
    <option value="Gym">Gym</option>
        <option value="Nature">Nature</option>
        <option value="">Uncategorized</option>
    

  </select>

        {/* Thumbnail preview */}
        {thumbnail ? (
  <img
    src={URL.createObjectURL(thumbnail)}
    alt="New Thumbnail Preview"
    className="w-48 mt-2 mb-2 rounded border"
  />
) : existingThumbnail ? (
  <img
    src={`http://localhost:5000/uploads/${existingThumbnail}`}
    alt="Current Thumbnail"
    className="w-48 mt-2 mb-2 rounded border"
  />
) : null}

        <button
          type="submit"
          disabled={loading}
          className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Updating..." : "Update Blog"}
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
