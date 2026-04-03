import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { Button, Modal, Box } from "@mui/material";
import { useMaterialUIController } from "context";

import { get, post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  backgroundColor: "#ffffff",
  borderRadius: 12,
  padding: "25px 30px",
  boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 15,
  marginBottom: 15,
};

function Charity() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [charities, setCharities] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const res = await get(ENDPOINTS.GET_CHARITY);
    setCharities(res.data.data);
  };

  const openAddModal = () => {
    setEditData(null);
    setTitle("");
    setShortDescription("");
    setContent("");
    setImage(null);
    setOpenModal(true);
  };

  const openEditModal = (c) => {
    setEditData(c);
    setTitle(c.title);
    setShortDescription(c.shortDescription);
    setContent(c.content);
    setImage(null);
    setOpenModal(true);
  };

  const saveCharity = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("shortDescription", shortDescription);
    formData.append("content", content);
    if (image) formData.append("image", image);

    await post(ENDPOINTS.ADD_CHARITY, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setOpenModal(false);
    fetchCharities();
  };

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <div
        style={{
          borderRadius: 15,
          padding: 20,
          backgroundColor: "#fafafa",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Charity List</h2>
            <p style={{ margin: 0, color: "#666" }}>Manage charity items</p>
          </div>

          <Button
            style={{
              backgroundColor: "#00c853",
              color: "white",
              fontWeight: "bold",
              height: 45,
            }}
            onClick={openAddModal}
          >
            + ADD CHARITY
          </Button>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
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
                <th style={headerCell}>Description</th>
                <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {charities.map((c, index) => (
                <tr key={c._id}>
                  <td style={bodyCell}>{index + 1}</td>

                  <td style={bodyCell}>
                    {c.image ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${c.image}`}
                        width={45}
                        style={{
                          borderRadius: 8,
                          objectFit: "cover",
                          height: 45,
                        }}
                      />
                    ) : (
                      <span style={{ color: "#aaa" }}>No image</span>
                    )}
                  </td>

                  <td style={bodyCell}>{c.title}</td>
                  <td style={bodyCell}>{c.shortDescription}</td>

                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    <button
                      style={{
                        padding: "6px 12px",
                        background: "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => openEditModal(c)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={modalStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>
              {editData ? "Edit Charity" : "Add Charity"}
            </h3>

            <input
              style={inputStyle}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              style={inputStyle}
              placeholder="Short Description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />

            <textarea
              style={{ ...inputStyle, height: 100 }}
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <label style={{ fontSize: 14, fontWeight: "bold" }}>Upload Image</label>
            <input
              type="file"
              style={{ marginBottom: 20 }}
              onChange={(e) => setImage(e.target.files[0])}
            />

            <Button
              fullWidth
              style={{
                backgroundColor: "#00c853",
                color: "white",
                padding: "10px 0",
                borderRadius: 8,
                fontWeight: "bold",
              }}
              onClick={saveCharity}
            >
              Save
            </Button>
          </Box>
        </Modal>
      </div>
    </MDBox>
  );
}

const headerCell = {
  padding: "14px 12px",
  border: "1px solid #ddd",
  fontSize: 16,
  fontWeight: "bold",
  backgroundColor: "#007bff",
  color: "white",
};

const bodyCell = {
  padding: "12px",
  border: "1px solid #eee",
  fontSize: 15,
  backgroundColor: "#fff",
};

export default Charity;
