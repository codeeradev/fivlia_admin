// components/ImagePicker.js
import { Button } from "@mui/material";
import React from "react";

export default function ImagePicker({ onSelect }) {
  return (
    <>
      <Button
        style={{
          backgroundColor: "#6a1b9a",
          height: 45,
          width: 200,
          fontSize: 13,
          color: "white",
          letterSpacing: "1px",
          cursor: "pointer",
        }}
        onClick={() => document.getElementById("socialGalleryPicker").click()}
      >
        Upload Product Images
      </Button>

      <input
        id="socialGalleryPicker"
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          onSelect(files);
          e.target.value = ""; // reset input
        }}
      />
    </>
  );
}
