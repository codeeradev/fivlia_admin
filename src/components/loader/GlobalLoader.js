import React from "react";
import "./loader.css"; // styling below
import { useSelector } from "react-redux";

export default function GlobalLoader() {
  const loading = useSelector((state) => state.app.loading);
  if (!loading) return null;

  return (
    <div className="global-loader">
      <div className="spinner" />
    </div>
  );
}
