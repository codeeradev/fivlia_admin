// DownloadAppPages.jsx
import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, del, post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

const IMAGE_PREFIX = process.env.REACT_APP_IMAGE_LINK || "";

const headerCell = {
  padding: "14px 12px",
  border: "1px solid #ddd",
  fontSize: 18,
  fontWeight: "bold",
  backgroundColor: "#007bff",
  color: "white",
};

const bodyCell = {
  padding: "12px",
  border: "1px solid #eee",
  fontSize: 17,
  backgroundColor: "#fff",
};

export default function DownloadAppPages() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [allApps, setAllApps] = useState([]);
  const [apps, setApps] = useState([]);

  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    appName: "",
    platform: "", // <-- replaced stream
    appLink: "",
    description: "",
    appImage: null,
    existingImage: "",
  });

  const [saving, setSaving] = useState(false);

  // Fetch all items
  const fetchApps = async () => {    
    try {
      showAlert("loading","Loading app list");
      const res = await get(ENDPOINTS.GET_DOWNLOAD_APP_PAGES);
      const data = res.data;

      const arr = Array.isArray(data) ? data : [];
      setAllApps(arr);
      applyFilters(arr);
      showAlert("info","", 0);
    } catch (err) {
      console.error("Fetch error:", err);
      showAlert("error", "Failed to load app list");
    }
  };

  // Apply pagination + search
  const applyFilters = (arr) => {
    const filtered = arr.filter((item) =>
      (item.appName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    setTotalPages(Math.ceil(filtered.length / entriesToShow) || 1);

    const start = (currentPage - 1) * entriesToShow;
    const sliced = filtered.slice(start, start + entriesToShow);

    setApps(sliced);
  };

  useEffect(() => {
    applyFilters(allApps);
  }, [allApps, searchTerm, entriesToShow, currentPage]);

  useEffect(() => {
    fetchApps();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      appName: "",
      platform: "",
      appLink: "",
      description: "",
      appImage: null,
      existingImage: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const editApp = (item) => {
    setEditingId(item._id);
    setForm({
      appName: item.appName || "",
      platform: item.stream || "",
      appLink: item.appLink || "",
      description: item.description || "",
      existingImage: item.appImage || "",
      appImage: null,
    });
    setModalOpen(true);
  };

  const saveApp = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      if (form.appImage instanceof File) {
        formData.append("image", form.appImage);
      }

      formData.append("appName", form.appName);
      formData.append("stream", form.platform); // changed name
      formData.append("appLink", form.appLink);
      formData.append("description", form.description);

      let res;
      if (editingId) {
        res = await post(ENDPOINTS.UPDATE_DOWNLOAD_APP(editingId), formData);
        showAlert("success", "App Page Updated Successfully");
      } else {
        res = await post(ENDPOINTS.ADD_DOWNLOAD_APP, formData);
        showAlert("success", "App Page Added Successfully",);
      }

      await fetchApps();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to save app");
    } finally {
      setSaving(false);
    }
  };

  const deleteApp = async (id) => {
    if (!window.confirm("Delete this app page?")) return;

    try {
      await del(ENDPOINTS.DELETE_DOWNLOAD_APP(id));
      showAlert("success", "App Page Deleted Successfully");
      fetchApps();
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to delete app");
    }
  };

  const resolveImage = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return IMAGE_PREFIX + img;
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
          overflowX: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Download App Pages</h2>
            <p style={{ fontSize: 16, color: "#666" }}>Manage downloadable app pages</p>
          </div>

          <Button
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 150,
              fontSize: 14,
              color: "white",
              letterSpacing: "1px",
            }}
            variant="contained"
            onClick={openAddModal}
          >
            + ADD APP
          </Button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 16, marginRight: 10 }}>Show Entries</label>
            <select
              value={entriesToShow}
              onChange={(e) => {
                setEntriesToShow(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 16 }}>Search</label>
            <br />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search App..."
              style={{
                padding: "8px 15px",
                borderRadius: "20px",
                height: "40px",
                width: "200px",
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr>
                <th style={headerCell}>Sr.</th>
                <th style={headerCell}>Image</th>
                <th style={headerCell}>App Name</th>
                <th style={headerCell}>Platform</th>
                <th style={headerCell}>Link</th>
                <th style={headerCell}>Description</th>
                <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {apps.map((app, index) => (
                <tr key={app._id}>
                  <td style={bodyCell}>{(currentPage - 1) * entriesToShow + index + 1}</td>

                  <td style={bodyCell}>
                    <img
                      src={resolveImage(app.appImage)}
                      width="45"
                      height="45"
                      style={{ borderRadius: 6, objectFit: "cover" }}
                      alt=""
                    />
                  </td>

                  <td style={bodyCell}>{app.appName}</td>
                  <td style={bodyCell}>{app.stream}</td>

                  <td style={bodyCell}>
                    <a href={app.appLink} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </td>

                  <td style={bodyCell}>{app.description}</td>

                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    <button
                      style={{
                        background: "#007BFF",
                        color: "white",
                        border: "none",
                        padding: "6px 16px",
                        borderRadius: 6,
                        marginRight: 10,
                        cursor: "pointer",
                      }}
                      onClick={() => editApp(app)}
                    >
                      Edit
                    </button>

                    <button
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        padding: "6px 16px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                      onClick={() => deleteApp(app._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {apps.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ ...bodyCell, textAlign: "center", color: "#999" }}>
                    No apps found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span>
            Showing {(currentPage - 1) * entriesToShow + 1}-
            {Math.min(currentPage * entriesToShow, totalPages * entriesToShow)} of{" "}
            {
              allApps.filter((a) => a.appName.toLowerCase().includes(searchTerm.toLowerCase()))
                .length
            }{" "}
            apps
          </span>

          <div>
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: "8px 16px", marginRight: 10, borderRadius: 10 }}
            >
              Prev
            </button>

            <span style={{ margin: "0 10px" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: "8px 16px", borderRadius: 10 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Dialog - Add/Edit */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit App Page" : "Add App Page"}</DialogTitle>

        <DialogContent dividers>
          <TextField
            label="App Name"
            fullWidth
            margin="normal"
            value={form.appName}
            onChange={(e) => setForm({ ...form, appName: e.target.value })}
          />

          {/* PLATFORM DROPDOWN */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 16, fontWeight: "bold" }}>Platform</label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginTop: "8px",
              }}
            >
              <option value="">Select Platform</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
            </select>
          </div>

          <TextField
            label="App Link"
            fullWidth
            margin="normal"
            value={form.appLink}
            onChange={(e) => setForm({ ...form, appLink: e.target.value })}
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 16, fontWeight: "bold" }}>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, appImage: e.target.files[0] })}
              style={{ marginTop: 8 }}
            />
          </div>

          {editingId && form.existingImage && (
            <img
              src={resolveImage(form.existingImage)}
              width="100"
              height="100"
              style={{
                marginTop: 15,
                borderRadius: 8,
                objectFit: "cover",
              }}
              alt=""
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="error">
            Cancel
          </Button>
          <Button onClick={saveApp} color="primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
