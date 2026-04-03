import React, { useState } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom";

import { post, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function AddBlog() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    title: state?.title || "",
    category: state?.category || "",
    content: state?.content || "",
    metaTitle: state?.metaTitle || "",
    metaDescription: state?.metaDescription || "",
    tags: state?.tags?.join(", ") || "",
    author: state?.author || "",
    status: state?.status || "published",
    image: null,
  });

  const [preview, setPreview] = useState(state?.image ? `${process.env.REACT_APP_IMAGE_LINK}${state.image}` : null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setForm({ ...form, [name]: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    showAlert("loading", state?._id ? "Updating blog..." : "Adding blog...");
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);

    let response;

    if (state?._id) {
      // UPDATE BLOG
      response = await put(`${ENDPOINTS.EDIT_BLOG}/${state._id}`, formData);
    } else {
      // ADD BLOG
      response = await post(ENDPOINTS.ADD_BLOG, formData);
    }

    showAlert("success", state?._id ? "Blog updated successfully" : "Blog added successfully");
    navigate("/blog");
    } catch (err) {
    console.error(err);
    showAlert("error", "Failed to save blog");
    }
  };

  return (
    <MDBox
      p={3}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <Card elevation={3} sx={{ maxWidth: 900, margin: "0 auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {state ? "Edit Blog" : "Add New Blog"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </TextField>
              </Grid>

              {/* Author */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Author"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                />
              </Grid>

              {/* Meta Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Title"
                  name="metaTitle"
                  value={form.metaTitle}
                  onChange={handleChange}
                />
              </Grid>

              {/* Meta Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Meta Description"
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                />
              </Grid>

              {/* Content */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Blog Image
                </Typography>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  style={{ marginBottom: "1rem" }}
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "200px",
                      height: "auto",
                      borderRadius: "8px",
                      display: "block",
                    }}
                  />
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{ color: "white" }}
                >
                  {state ? "Update Blog" : "Add Blog"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </MDBox>
  );
}

export default AddBlog;
