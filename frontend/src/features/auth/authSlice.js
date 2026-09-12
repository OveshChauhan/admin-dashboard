// Stores the authenticated user, role, access token, and refresh token in Redux and localStorage.
import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("admin_dashboard_auth");
const initialState = saved
  ? JSON.parse(saved)
  : {
      user: null,
      accessToken: null,
      refreshToken: null
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: function (state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("admin_dashboard_auth", JSON.stringify(state));
    },
    clearCredentials: function (state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("admin_dashboard_auth");
    },
    updateUser: function (state, action) {
      state.user = action.payload;
      localStorage.setItem("admin_dashboard_auth", JSON.stringify(state));
    }
  }
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
