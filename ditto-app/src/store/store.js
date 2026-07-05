import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "./api/apiSlice";
import "./api/authApi";
import "./api/usersApi";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
