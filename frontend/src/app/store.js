// Configures the Redux Toolkit store with the authentication reducer and RTK Query middleware.
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { apiSlice } from "../features/api/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: function (getDefaultMiddleware) {
    return getDefaultMiddleware().concat(apiSlice.middleware);
  }
});
