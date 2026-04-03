import { configureStore } from "@reduxjs/toolkit";
import appReducer from "components/loader/appSlice"; // adjust path if needed

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

export default store;
