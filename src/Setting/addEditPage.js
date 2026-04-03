import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { ENDPOINTS } from "api/endPoints";
import { put, post } from "api/apiClient";
import { showAlert } from "components/commonFunction/alertsLoader";

function AddPageForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      const pageData = location.state;
      setTitle(pageData.title || "");
      setSlug(pageData.slug || "");
      setContent(pageData.content || "");
    }
  }, [location.state]);

  const handleSave = async () => {
    const data = {
      pageTitle : title,
      pageSlug : slug,
      pageContent : content,
    };
    try {
      const url = location.state ? `${ENDPOINTS.EDIT_PAGE}/${location.state.id}` : ENDPOINTS.ADD_PAGE;
      const method = location.state ? put : post;
      const response = await method(url, data);

      const result = response.data;
      console.log("Page saved:", result);
      showAlert("success", "Page Saved!");
      navigate(-1);
    } catch (error) {
      console.error("Error saving page:", error);
      showAlert("error", "Failed to save page.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="city-container">
        <h2 style={{ textAlign: "center", color: "#1976d2", fontWeight: 500 }}>
          ADD NEW PAGE
        </h2>

        <div className="add-city-box">
          <div className="row-section">
            <div className="input-container">
              <label>
                Page Title <span style={{ marginLeft: "5px" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Page Title"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ backgroundColor: "white" }}
              />
            </div>

            <div className="input-container">
              <label>
                Page Slug <span style={{ marginLeft: "5px" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Page Slug"
                className="input-field"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ backgroundColor: "white" }}
              />
            </div>
          </div>

          <div className="row-section">
            <div className="input-container" style={{ width: "100%" }}>
              <label>
                Page Content <span style={{ marginLeft: "5px" }}>*</span>
              </label>
              <ReactQuill
                value={content}
                onChange={setContent}
                style={{ backgroundColor: "white", height: "300px", marginBottom: "20px" }}
                placeholder="Write your page content here..."
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "30px", justifyContent: "center" }}>
            <Button
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              style={{
                backgroundColor: "gray",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default AddPageForm;