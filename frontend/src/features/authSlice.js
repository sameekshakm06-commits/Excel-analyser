
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

// ---- Thunks ----

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await API.post("/auth/register", data);
      localStorage.setItem("token", res.data.token);
      return res.data; 
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Registration failed" }
      );
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);

      // Return user directly
      const { _id, name, email, role } = res.data;
      return { _id, name, email, role };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Login failed" }
      );
    }
  }
);

// Fetch profile
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) return thunkAPI.rejectWithValue({ message: "No token" });

    try {
      const res = await API.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Failed to fetch profile" }
      );
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put("/auth/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Save new token if backend returns one
      if (res.data.token) localStorage.setItem("token", res.data.token);

      // Return updated user directly
      return res.data; 
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Profile update failed" }
      );
    }
  }
);

// ---- Slice ----
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.message = action.payload.message || "Signed up successfully!";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.message = "Signed in successfully!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.message = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Profile update failed";
      });
  },
});

export const { logout, setUser, clearMessage } = authSlice.actions;
export default authSlice.reducer;

