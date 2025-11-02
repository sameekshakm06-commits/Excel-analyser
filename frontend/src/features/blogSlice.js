
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";


export const fetchBlogs = createAsyncThunk(
  "blogs/fetchAll",
  async ({ page = 1, limit = 5 } = {}) => {
    const { data } = await API.get(`/blogs?page=${page}&limit=${limit}`);
    return data;
  }
);

export const fetchLatestBlogs = createAsyncThunk(
  "blogs/fetchLatest",
  async (limit = 5) => {
    const { data } = await API.get(`/blogs/latest?limit=${limit}`);
    return data;
  }
);

export const fetchSingleBlog = createAsyncThunk(
  "blogs/fetchSingle",
  async (id) => {
    const { data } = await API.get(`/blogs/${id}`);
    return data;
  }
);


export const createBlog = createAsyncThunk(
  "blogs/create",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await API.post("/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create blog"
      );
    }
  }
);



export const updateBlog = createAsyncThunk(
  "blogs/update",
  async ({ id, formData }) => {
    const { data } = await API.patch(`/blogs/${id}`, formData);
    return data;
  }
);


export const deleteBlog = createAsyncThunk(
  "blogs/delete",
  async (id) => {
    await API.delete(`/blogs/${id}`);
    return id;
  }
);


const blogSlice = createSlice({
  name: "blogs",
  initialState: {
    items: [],
    latest: [],
    selectedBlog: null,
    currentPage: 1,
    totalPages: 1,
    loadingAll: false,
    loadingLatest: false,
    loadingCreate: false,
    loadingUpdate: false,
    loadingDelete: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all blogs
      .addCase(fetchBlogs.pending, (state) => { state.loadingAll = true; })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loadingAll = false;
        state.items = action.payload.blogs || [];
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loadingAll = false;
        state.error = action.error.message;
      })

      // Fetch latest blogs
      .addCase(fetchLatestBlogs.pending, (state) => { state.loadingLatest = true; })
      .addCase(fetchLatestBlogs.fulfilled, (state, action) => {
        state.loadingLatest = false;
        state.latest = action.payload || [];
      })
      .addCase(fetchLatestBlogs.rejected, (state, action) => {
        state.loadingLatest = false;
        state.error = action.error.message;
      })

      // Fetch single blog
      .addCase(fetchSingleBlog.fulfilled, (state, action) => {
        state.selectedBlog = action.payload || null;
      })

      // Create blog
      .addCase(createBlog.pending, (state) => { state.loadingCreate = true; })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loadingCreate = false;
        state.items.unshift(action.payload);
        state.latest.unshift(action.payload); // also add to latest
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loadingCreate = false;
        state.error = action.error.message;
      })

      // Update blog
      .addCase(updateBlog.pending, (state) => { state.loadingUpdate = true; })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loadingUpdate = false;
        const idx = state.items.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selectedBlog?._id === action.payload._id) state.selectedBlog = action.payload;

        // Update latest if present
        const latestIdx = state.latest.findIndex((b) => b._id === action.payload._id);
        if (latestIdx !== -1) state.latest[latestIdx] = action.payload;
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loadingUpdate = false;
        state.error = action.error.message;
      })

      // Delete blog
      .addCase(deleteBlog.pending, (state) => { state.loadingDelete = true; })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loadingDelete = false;
        state.items = state.items.filter((b) => b._id !== action.payload);
        state.latest = state.latest.filter((b) => b._id !== action.payload);
        if (state.selectedBlog?._id === action.payload) state.selectedBlog = null;
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loadingDelete = false;
        state.error = action.error.message;
      });
  },
});

export default blogSlice.reducer;

