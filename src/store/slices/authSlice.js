import { createSlice } from "@reduxjs/toolkit";

const getTokenRole = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (e) {
    return null;
  }
};

const savedToken = localStorage.getItem("token");
// Clean up old role key to ensure it isn't stored
localStorage.removeItem("role");

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: savedToken || null,
  role: getTokenRole(savedToken),
  isAuthenticated: !!savedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = getTokenRole(token) || role;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("role"); // Ensure role is not saved explicitly
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
