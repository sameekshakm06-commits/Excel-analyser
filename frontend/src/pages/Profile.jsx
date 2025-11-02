
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateProfile, clearMessage, fetchProfile } from "../features/authSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, message } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: "", email: "" });

  // Fetch profile on mount if not loaded
  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile()).catch(console.error);
    }
  }, [user, dispatch]);

  // Pre-fill form when user is loaded
  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "" });
  }, [user]);

  // Auto-clear messages
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => dispatch(clearMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(updateProfile({ name: form.name, email: form.email })).unwrap();
      navigate("/dashboard");
    } catch (err) {
     
      const msg = err?.message || err?.payload?.message || "Profile update failed";
      console.error("Profile update failed:", msg);
      alert(msg);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!user) return <p className="text-center mt-20">Please login first</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-gradient-to-r from-blue-100 to-pink-200 p-6 rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Update Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="p-2 border rounded"
          required
        />
        


        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
