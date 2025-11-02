
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/register");
  };

  return (
    <nav className="bg-white shadow-md py-3 px-6 flex flex-wrap justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        MyBlog
      </Link>
      <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
        <Link
          to="/"
          className="hover:text-blue-600 transition-colors duration-200"
        >
          Home
        </Link>

        {user ? (
          <>
            <Link
              to="/create"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Create
            </Link>
            <Link
              to="/profile"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
