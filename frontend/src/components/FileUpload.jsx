
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile, resetUpload } from "../features/uploadSlice";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.upload);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !title) return alert("Please fill all fields");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    dispatch(uploadFile(formData));
  };

  // Reset success/error message after 3s
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => dispatch(resetUpload()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto" }}>
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {success && <p style={{ color: "green" }}>Upload successful!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
