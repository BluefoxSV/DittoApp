import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "ditto_access_token";

const storedToken = localStorage.getItem(TOKEN_KEY);

const initialState = {
  token: storedToken,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      if (token !== undefined) {
        state.token = token;
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      if (user !== undefined) {
        state.user = user;
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
