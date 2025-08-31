import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "./api/userApi";
import userReducer from "./reducer/userReducer"; // ✅ default import

const store = configureStore({
  reducer: {
    [userAPI.reducerPath]: userAPI.reducer, // RTK Query reducer
    user: userReducer, // user slice reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userAPI.middleware), // ✅ proper concat
});

export default store;
