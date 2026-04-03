import React from "react";
import { isSessionValid } from "components/commonFunction/session";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const sessionValid = isSessionValid();
  return sessionValid ? <Outlet /> : <Navigate to="/login" replace/>;
};

export default PrivateRoute;
