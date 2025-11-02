
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import BlogDetails from "./pages/BlogDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import LandingPage from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <div>
    
      <Routes>
  {/* Landing page */}
  <Route path="/" element={<LandingPage />} />

  {/* Sidebar recent posts */}
  <Route path="/blogs/recent/:sidebarId" element={<LandingPage />} />

  {/* Main blog page */}
  <Route path="/home" element={<Home />} />

  {/* Blog actions */}
  <Route path="/create" element={<CreateBlog />} />
  <Route path="/edit/:id" element={<EditBlog />} />
  <Route path="/blogs/:id" element={<BlogDetails />} />

  {/* Auth */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  {/* Dashboard (after login) */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ add this */}

  {/* User profile */}
  <Route path="/profile" element={<Profile />} />
  <Route path="/admin" element={<AdminDashboard />} />

</Routes>
</div>
  );
}