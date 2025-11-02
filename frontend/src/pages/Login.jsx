

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const result = await dispatch(loginUser(form)).unwrap(); 
      setMessage("Login successful!");

      const role = result?.role;
      if (!role) {
        console.error("Missing role in login result:", result);
        setError("Unexpected response from server");
        return;
      }

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-200 to-purple-200">
  <div className="bg-transparent p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-md">
  
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          type="submit"
          className={`bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-green-600">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <p className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/register")}
        >
          Register
        </span>
      </p>
    </div>
    </div>
  );
}
