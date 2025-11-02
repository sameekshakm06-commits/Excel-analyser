import axios from "./axios";

export const fetchLatestBlogs = async (limit = 5) => {
  const res = await axios.get(`/blogs/latest?limit=${limit}`);
  return res.data;
};

export const fetchUserBlogs = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const res = await axios.get("/blogs/user/blogs", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
