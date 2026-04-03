import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { Button, Modal, Box, Switch } from "@mui/material";
import { useMaterialUIController } from "context";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, post, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 550,
  backgroundColor: "#ffffff",
  borderRadius: 12,
  padding: "25px 30px",
  boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
  maxHeight: "85vh",
  overflowY: "auto",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 15,
  marginBottom: 15,
};

function CharityContent() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [contentList, setContentList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState(true);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [gallery, setGallery] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // FETCH CATEGORY
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await get(ENDPOINTS.GET_CHARITY_CATEGORY);
        setCategories(res.data?.data || []);
      } catch (err) {
        showAlert("error", "Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // FETCH CONTENT
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await get(ENDPOINTS.GET_CHARITY_CONTENT);

        const filtered = res.data.data.filter((item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setContentList(filtered.slice((page - 1) * limit, page * limit));
        setTotalPages(Math.ceil(filtered.length / limit));
      } catch (err) {
        showAlert("error", "Failed to load content");
      }
    };

    fetchContent();
  }, [page, searchTerm]);

  // OPEN ADD
  const openAddModal = () => {
    setEditData(null);
    setTitle("");
    setCategoryId("");
    setShortDescription("");
    setContent("");
    setVideoUrl("");
    setStatus(true);

    setImage(null);
    setImagePreview(null);

    setGallery([]);
    setGalleryPreview([]);

    setOpenModal(true);
  };

  // OPEN EDIT
  const openEditModal = (item) => {
    setEditData(item);
    setTitle(item.title);
    setCategoryId(item.categoryId?._id || "");
    setShortDescription(item.shortDescription);
    setContent(item.content);
    setVideoUrl(item.videoUrl || "");
    setStatus(item.status);

    // OLD PREVIEWS
    setImagePreview(item.image ? `${process.env.REACT_APP_IMAGE_LINK}${item.image}` : null);

    setGalleryPreview((item.gallery || []).map((g) => `${process.env.REACT_APP_IMAGE_LINK}${g}`));

    setImage(null);
    setGallery([]);

    setOpenModal(true);
  };

  // IMAGE SELECT
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file)); // preview
  };

  // GALLERY SELECT
  const handleGallerySelect = (e) => {
    const files = [...e.target.files];

    setGallery((old) => [...old, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreview((old) => [...old, ...previews]);
  };

  // SAVE
  const saveContent = async () => {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("categoryId", categoryId);
    formData.append("shortDescription", shortDescription);
    formData.append("content", content);
    formData.append("videoUrl", videoUrl);
    formData.append("status", status ? "true" : "false");

    if (image) formData.append("image", image);
    gallery.forEach((file) => formData.append("MultipleImage", file));

    const url = editData
      ? `${ENDPOINTS.UPDATE_CHARITY_CONTENT}/${editData._id}`
      : ENDPOINTS.CREATE_CHARITY_CONTENT;

    try {
      showAlert("loading", editData ? "Updating..." : "Creating...");

      const apiCall = editData ? put(url, formData, true) : post(url, formData, true);

      await apiCall;

      showAlert("success", editData ? "Updated Successfully" : "Created Successfully");

      setOpenModal(false);
      window.location.reload();
    } catch (err) {
      showAlert("error", "Failed to save");
    }
  };

  // STATUS UPDATE IN TABLE
  const toggleStatus = async (id, currentStatus) => {
    showAlert("loading", "Updating status...");

    await put(`${ENDPOINTS.UPDATE_CHARITY_CONTENT}/${id}`, {
      status: !currentStatus,
    });

    setContentList((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status: !currentStatus } : item))
    );
  };

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      {/* CONTENT LIST */}
      <div style={{ borderRadius: 15, padding: 20, backgroundColor: "#fafafa" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Charity Content List</h2>
          <Button style={{ backgroundColor: "#00c853", color: "white" }} onClick={openAddModal}>
            + ADD CONTENT
          </Button>
        </div>

        <div style={{ marginTop: 20 }}>
          <input
            placeholder="Search..."
            style={{
              padding: 10,
              borderRadius: 20,
              width: 300,
              border: "1px solid #ccc",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr>
                <th style={headerCell}>Sr</th>
                <th style={headerCell}>Image</th>
                <th style={headerCell}>Title</th>
                <th style={headerCell}>Category</th>
                <th style={headerCell}>Status</th>
                <th style={headerCell}>Action</th>
              </tr>
            </thead>

            <tbody>
              {contentList.map((item, idx) => (
                <tr key={item._id}>
                  <td style={bodyCell}>{idx + 1}</td>

                  <td style={bodyCell}>
                    <img
                      src={
                        item.image
                          ? `${process.env.REACT_APP_IMAGE_LINK}${item.image}`
                          : "https://via.placeholder.com/50"
                      }
                      width={50}
                      height={50}
                      style={{ borderRadius: 6, objectFit: "cover" }}
                    />
                  </td>

                  <td style={bodyCell}>{item.title}</td>
                  <td style={bodyCell}>{item.categoryId?.title || "-"}</td>

                  <td style={bodyCell}>
                    <Switch
                      checked={item.status}
                      onChange={() => toggleStatus(item._id, item.status)}
                      color="success"
                    />
                  </td>

                  <td style={bodyCell}>
                    <button
                      onClick={() => openEditModal(item)}
                      style={{
                        padding: "6px 12px",
                        background: "#007bff",
                        color: "white",
                        borderRadius: 6,
                        border: "none",
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={paginationBtn(page === 1)}
          >
            Previous
          </button>
          <span style={{ margin: "0 12px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={paginationBtn(page === totalPages)}
          >
            Next
          </button>
        </div>

        {/* MODAL */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={modalStyle}>
            <h3>{editData ? "Edit Content" : "Add Content"}</h3>

            <input
              style={inputStyle}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              style={inputStyle}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>

            <textarea
              style={{ ...inputStyle, height: 80 }}
              placeholder="Short Description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={250}
            />

            <textarea
              style={{ ...inputStyle, height: 130 }}
              placeholder="Full Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <input
              style={inputStyle}
              type="text"
              placeholder="Video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />

            {/* IMAGE PREVIEW */}
            <div>
              <label>Main Image</label>
              <input type="file" onChange={handleImageSelect} />

              {imagePreview && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={imagePreview}
                    width={90}
                    height={90}
                    style={{ borderRadius: 10, objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            {/* GALLERY PREVIEW */}
            <div style={{ marginTop: 20 }}>
              <label>Gallery Images</label>
              <input type="file" multiple onChange={handleGallerySelect} />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {galleryPreview.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    width={80}
                    height={80}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                ))}
              </div>
            </div>

            {/* STATUS TOGGLE */}
            <div style={{ marginTop: 20 }}>
              <label>Status</label>
              <Switch
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                color="success"
              />
            </div>

            <Button
              fullWidth
              onClick={saveContent}
              style={{
                backgroundColor: "#00c853",
                color: "white",
                padding: "12px",
                borderRadius: 8,
                marginTop: 20,
              }}
            >
              Save
            </Button>
          </Box>
        </Modal>
      </div>
    </MDBox>
  );
}

const paginationBtn = (disabled) => ({
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #aaa",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
});

const headerCell = {
  padding: "14px 12px",
  fontWeight: "bold",
  border: "1px solid #ddd",
  backgroundColor: "#007bff",
  color: "white",
};

const bodyCell = {
  padding: "12px",
  border: "1px solid #eee",
  backgroundColor: "#fff",
};

export default CharityContent;
