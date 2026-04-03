import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { get, post, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

export default function StatusManagement() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [newStatusCode, setNewStatusCode] = useState("");
  const [newStatusTitle, setNewStatusTitle] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [entriesToShow, setEntriesToShow] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editImage, setEditImage] = useState(null);

  const headerCell = {
    padding: "14px 12px",
    border: "1px solid #ddd",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#007bff",
    color: "white",
    textAlign: "center",
  };

  const bodyCell = {
    padding: "12px",
    border: "1px solid #eee",
    fontSize: 17,
    backgroundColor: "#fff",
    textAlign: "center",
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        showAlert("loading", "Loading statuses...");

        const res = await get(ENDPOINTS.GET_DELIVERY_STATUS);
        const data = res.data;

        setStatuses(
          data.Status.map((s) => ({
            id: s._id,
            statusCode: s.statusCode || "",
            statusTitle: s.statusTitle || "",
            isActive: s.status || false,
            image: s.image || "",
          }))
        );

        showAlert("info", "", 1);
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
        showAlert("error", "Failed to load statuses.");
      }
    };
    fetchStatuses();
  }, []);

  const toggleStatus = async (id) => {
    const statusToUpdate = statuses.find((s) => s.id === id);
    if (!statusToUpdate) return;

    const newStatus = !statusToUpdate.isActive;

    try {
      await put(`${ENDPOINTS.UPDATE_DELIVERY_STATUS}/${id}`, {
        status: newStatus,
      });

      setStatuses((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: newStatus } : s)));
      showAlert("success", "Status updated");
    } catch (error) {
      showAlert("error", "Failed to update status");
      console.error("Toggle status error:", error);
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusTitle) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("statusCode", newStatusCode);
      formData.append("statusTitle", newStatusTitle);
      formData.append("status", "true");
      if (newImage) formData.append("image", newImage);

      const res = await post(ENDPOINTS.DELIVERY_STATUS, formData);
      const data = res.data;

      setStatuses((prev) => [
        ...prev,
        {
          id: data.newStatus._id,
          statusCode: newStatusCode,
          statusTitle: newStatusTitle,
          isActive: true,
          image: data.newStatus.image || "",
        },
      ]);

      setModalOpen(false);
      setNewStatusCode("");
      setNewStatusTitle("");
      setNewImage(null);
      showAlert("success", "Status added");
    } catch (error) {
      console.error("Add status error:", error);
      showAlert("error", "Failed to add status");
    }
  };

  const handleEdit = (status) => {
    setSelectedStatus(status);
    setNewStatusCode(status.statusCode);
    setNewStatusTitle(status.statusTitle);
    setEditImage(null);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!newStatusCode || !newStatusTitle) {
      showAlert("error", "Please fill in all fields");

      return;
    }

    try {
      const formData = new FormData();
      formData.append("statusCode", newStatusCode);
      formData.append("statusTitle", newStatusTitle);
      formData.append("status", selectedStatus.isActive);
      if (editImage) formData.append("image", editImage);

      const res = await put(`${ENDPOINTS.UPDATE_DELIVERY_STATUS}/${selectedStatus.id}`, formData);

      const data = res.data;

      setStatuses((prev) =>
        prev.map((s) =>
          s.id === selectedStatus.id
            ? {
                ...s,
                statusCode: newStatusCode,
                statusTitle: newStatusTitle,
                image: data.newStatus.image || s.image,
              }
            : s
        )
      );

      setEditModalOpen(false);
      setSelectedStatus(null);
      setNewStatusCode("");
      setNewStatusTitle("");
      setEditImage(null);
      showAlert("success", "Status updated");
    } catch (error) {
      console.error("Update status error:", error);
      showAlert("error", "Failed to update status");
    }
  };

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const filteredStatuses = statuses.filter(
    (s) =>
      s.statusCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.statusTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStatuses.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentStatuses = filteredStatuses.slice(startIndex, endIndex);

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Status Management</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>Manage order statuses</p>
          </div>
          <Button
            variant="contained"
            ominantColor
            onClick={() => setModalOpen(true)}
            style={{
              backgroundColor: "#007BFF",
              color: "white",
              height: "60px",
              width: "150px",
              borderRadius: "6px",
            }}
          >
            Add Status
          </Button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div>
            <label style={{ fontSize: 17 }}>Show Entries </label>
            <select
              value={entriesToShow}
              onChange={handleEntriesChange}
              style={{
                fontSize: 16,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              {[50, 100, 200, 300].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <label style={{ fontSize: 17, marginRight: 8 }}>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search statuses..."
                style={{
                  padding: "8px 34px",
                  borderRadius: "8px",
                  height: "42px",
                  width: "220px",
                  border: "1px solid #ccc",
                  fontSize: 16,
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: '"Urbanist", sans-serif',
            fontSize: "17px",
            border: "1px solid #007BFF",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={headerCell}>Sr No</th>
              <th style={headerCell}>Image</th>
              <th style={headerCell}>Status Code</th>
              <th style={headerCell}>Status Title</th>
              <th style={headerCell}>Status</th>
              <th style={headerCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentStatuses.length > 0 ? (
              currentStatuses.map((status, index) => (
                <tr
                  key={status.id}
                  style={{
                    backgroundColor: selectedStatus?.id === status.id ? "#f1f1f1" : "white",
                    cursor: "pointer",
                  }}
                >
                  <td style={bodyCell}>{startIndex + index + 1}</td>
                  <td style={bodyCell}>
                    {status.image ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${status.image}`}
                        alt={status.statusTitle}
                        style={{ width: 40, height: 40, borderRadius: "6px", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: "#999" }}>No image</span>
                    )}
                  </td>
                  <td style={bodyCell}>{status.statusCode}</td>
                  <td style={bodyCell}>{status.statusTitle}</td>
                  <td style={bodyCell}>
                    <Switch
                      checked={status.isActive}
                      onChange={() => toggleStatus(status.id)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#00c853" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#00c853 !important",
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor: "red",
                          opacity: 1,
                        },
                      }}
                    />
                  </td>
                  <td style={bodyCell}>
                    <button
                      onClick={() => handleEdit(status)}
                      style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No statuses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredStatuses.length)} of{" "}
            {filteredStatuses.length} entries
          </div>
          <div>
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === 1 ? "#ccc" : "#007BFF",
                color: currentPage === 1 ? "#666" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                marginRight: "8px",
              }}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === totalPages ? "#ccc" : "#007BFF",
                color: currentPage === totalPages ? "#666" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Status Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Status</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Status Title"
            fullWidth
            margin="normal"
            value={newStatusTitle}
            onChange={(e) => setNewStatusTitle(e.target.value)}
            placeholder="e.g., Pending"
          />
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 16, fontWeight: "bold" }}>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0])}
              style={{ marginTop: 8 }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleAddStatus} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Status</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Status Code"
            fullWidth
            margin="normal"
            value={newStatusCode}
            onChange={(e) => setNewStatusCode(e.target.value)}
            placeholder="e.g., PEND"
          />
          <TextField
            label="Status Title"
            fullWidth
            margin="normal"
            value={newStatusTitle}
            onChange={(e) => setNewStatusTitle(e.target.value)}
            placeholder="e.g., Pending"
          />
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 16, fontWeight: "bold" }}>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditImage(e.target.files[0])}
              style={{ marginTop: 8 }}
            />
            {selectedStatus?.image && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={`${process.env.REACT_APP_IMAGE_LINK}${selectedStatus.image}`}
                  alt="Preview"
                  style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
