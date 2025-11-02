


import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await dispatch(registerUser(form)).unwrap();
      setMessage("Signed up successfully!");
      setLoading(false);

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-green-200">
  <div className="bg-transparent p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-md">
  
    
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          type="submit"
          className={`bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-green-600">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-center text-sm font-medium text-red-600">{error}</p>
      )}

      <p className="mt-6 text-center text-sm text-gray-700">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
    </div>
  );
}
