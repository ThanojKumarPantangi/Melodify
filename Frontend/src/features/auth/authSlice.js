import { createSlice } from "@reduxjs/toolkit";

// Load from localStorage (initial state)
const storedAuth = JSON.parse(localStorage.getItem("auth"));

const initialState = {
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
  isAuthenticated: !!storedAuth?.token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login Start
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Login Success
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;

      state.loading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      // Save to localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({ user, token })
      );
    },

    // Login Failure
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("auth");
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;