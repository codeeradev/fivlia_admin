// components/ImageUploadPanel.js
import React, { useState } from "react";
import { showAlert } from "components/commonFunction/alertsLoader";
import { post } from "../../api/apiClient";
import { ENDPOINTS } from "../../api/endPoints";

export default function ImageUploadPanel({ images, clearImages, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const uploadImages = async () => {
    if (images.length === 0) {
      showAlert("error", "Please select images first");
      return;
    }

    setUploading(true);
    showAlert("loading", "Uploading images...");

    const formData = new FormData();
    images.forEach((img) => formData.append("ProductImages", img));

    try {
      const res = await post(ENDPOINTS.BULK_IMAGE_UPLOAD, formData);

      const result = res.data;
      if (res.status === 200) {
        showAlert("success", "Images uploaded successfully");
        onUploaded(result);
        clearImages();
      } else {
        showAlert("error", result.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Upload failed");
    }

    setUploading(false);
  };

  return (
    <>
      {images.length > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #eee",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Selected Images: {images.length}</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {images.map((file, idx) => (
              <div
                key={idx}
                style={{
                  width: 90,
                  textAlign: "center",
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{
                    width: 90,
                    height: 90,
                    objectFit: "cover",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                />
                <button
                  onClick={() => {
                    const newArr = images.filter((_, i) => i !== idx);
                    clearImages(newArr);
                  }}
                  style={{
                    marginTop: 4,
                    background: "#ff5252",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 6px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={uploadImages}
            disabled={uploading}
            style={{
              marginTop: 15,
              background: "#6a1b9a",
              padding: "10px 20px",
              borderRadius: 6,
              color: "white",
              border: "none",
              cursor: "pointer",
              width: 200,
              fontSize: 14,
            }}
          >
            {uploading ? "Uploading..." : "Upload All"}
          </button>
        </div>
        
      )}
    </>
  );
}
