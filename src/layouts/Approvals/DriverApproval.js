// DriversApprovalRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import Swal from "sweetalert2";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import DataTable from "react-data-table-component";

import { get, del, post, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function DriversApprovalRequests() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const dispatch = useDispatch();

  const [driverRequests, setDriverRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const [uploadDriver, setUploadDriver] = useState(null);

  // 4 SEPARATE FILES
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [dlFront, setDlFront] = useState(null);
  const [dlBack, setDlBack] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [uploading, setUploading] = useState(false);

  const IMAGE_BASE = process.env.REACT_APP_IMAGE_LINK;

  // ===============================
  // FETCH REQUESTS
  // ===============================
  const fetchRequests = async () => {
    try {
      dispatch(startLoading());
      const res = await get(ENDPOINTS.GET_DRIVER_REQUEST);
      const data = res.data;

      setDriverRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch {
      Swal.fire("Error", "Failed to fetch driver requests", "error");
    } finally {
      dispatch(stopLoading());
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ===============================
  // APPROVE / REJECT
  // ===============================
  const handleDriverAction = async (id, action) => {
    try {
      dispatch(startLoading());
      const body = { type: "driver", approval: action, id };

      const res = await put(ENDPOINTS.DRIVER_APPROVAL, body);
      const json = res.data;

      setDriverRequests((prev) =>
        prev.map((d) => (d._id === id ? { ...d, approveStatus: action } : d))
      );

      Swal.fire(action, json.message, action === "approved" ? "success" : "error");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      dispatch(stopLoading());
    }
  };

  // ===============================
  // OPEN UPLOAD MODAL
  // ===============================
  const openUploadModal = (driver) => {
    setUploadDriver(driver);

    // Reset previous files
    setAadharFront(null);
    setAadharBack(null);
    setDlFront(null);
    setDlBack(null);
    setProfileImage(null);

    setOpenUpload(true);
  };

  // ===============================
  // UPLOAD SUBMIT — FINAL VERSION
  // ===============================
  const handleUploadSubmit = async () => {
    if (!uploadDriver) return;

    if (!aadharFront || !aadharBack) {
      return Swal.fire("Missing Aadhar", "Upload both Aadhar front & back", "warning");
    }
    if (!dlFront || !dlBack) {
      return Swal.fire("Missing Licence", "Upload both Licence front & back", "warning");
    }

    try {
      dispatch(startLoading());
      setUploading(true);

      const form = new FormData();

      if (profileImage) form.append("image", profileImage);

      // MUST append in exact order for backend
      form.append("aadharCard", aadharFront);
      form.append("aadharCard", aadharBack);

      form.append("drivingLicence", dlFront);
      form.append("drivingLicence", dlBack);

      const res = await put(`${ENDPOINTS.EDIT_DRIVER}/${uploadDriver._id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const json = res.data;

      Swal.fire("Success", "Documents updated", "success");

      setOpenUpload(false);
      fetchRequests();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      dispatch(stopLoading());
      setUploading(false);
    }
  };

  // ===============================
  // DATATABLE COLUMNS
  // ===============================
  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (row, idx) => idx + 1,
        width: "60px",
        center: true,
      },
      {
        name: "Image",
        cell: (row) => (
          <img
            src={row.image ? `${IMAGE_BASE}${row.image}` : `${IMAGE_BASE}/default-avatar.png`}
            width={42}
            height={42}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ),
        center: true,
        width: "70px",
      },
      {
        name: "Driver Name",
        selector: (row) => row.driverName,
        sortable: true,
      },
      {
        name: "Mobile",
        selector: (row) => row.address?.mobileNo,
      },
      {
        name: "Email",
        selector: (row) => row.email,
      },
      {
        name: "Status",
        cell: (row) => (
          <Chip
            label={row.approveStatus?.replace(/_/g, " ") || "pending"}
            color={
              row.approveStatus === "approved"
                ? "success"
                : row.approveStatus === "rejected"
                ? "error"
                : "warning"
            }
            size="small"
          />
        ),
        center: true,
      },
      {
        name: "Upload Docs",
        center: true,
        cell: (row) => (
          <MDButton
            color="info"
            size="small"
            onClick={() => openUploadModal(row)}
            startIcon={<UploadFileIcon />}
          >
            Upload
          </MDButton>
        ),
      },
      {
        name: "Action",
        center: true,
        cell: (row) => {
          const pending = !row.approveStatus || row.approveStatus === "pending_admin_approval";

          return pending ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                padding: "4px 0",
              }}
            >
              <MDButton
                size="small"
                color="success"
                onClick={() => handleDriverAction(row._id, "approved")}
                startIcon={<CheckIcon />}
                style={{ minWidth: "90px" }}
              >
                Approve
              </MDButton>

              <MDButton
                size="small"
                color="error"
                onClick={() => handleDriverAction(row._id, "rejected")}
                startIcon={<CloseIcon />}
                style={{ minWidth: "90px" }}
              >
                Reject
              </MDButton>
            </div>
          ) : (
            <Chip
              label={row.approveStatus}
              size="small"
              color={row.approveStatus === "approved" ? "success" : "error"}
              style={{ fontWeight: "bold" }}
            />
          );
        },
      },
      {
        name: "View",
        center: true,
        cell: (row) => (
          <IconButton
            onClick={() => {
              setSelectedRequest(row);
              setOpenViewDialog(true);
            }}
          >
            <VisibilityIcon />
          </IconButton>
        ),
      },
    ],
    []
  );

  // ===============================
  // FILTER
  // ===============================
  const filtered = driverRequests.filter((d) =>
    `${d.driverName} ${d.email} ${d.address?.mobileNo}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ===============================
  // VIEW DETAILS
  // ===============================
  const renderDetails = (r) => (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <MDTypography>
          <b>Name:</b> {r.driverName}
        </MDTypography>
        <MDTypography>
          <b>Email:</b> {r.email}
        </MDTypography>
        <MDTypography>
          <b>Mobile:</b> {r.address?.mobileNo}
        </MDTypography>
      </Grid>

      <Grid item xs={6}>
        <MDTypography fontWeight="bold" mb={1}>
          Aadhar
        </MDTypography>

        <MDBox display="flex" gap={2} flexWrap="wrap" mb={3}>
          {r.aadharCard?.front ? (
            <MDBox textAlign="center">
              <MDTypography variant="caption">Front</MDTypography>
              <img
                src={`${IMAGE_BASE}${r.aadharCard.front}`}
                width={120}
                style={{
                  borderRadius: 6,
                  display: "block",
                  marginTop: 4,
                  border: "1px solid #ddd",
                  padding: 4,
                }}
              />
            </MDBox>
          ) : (
            <MDTypography variant="body2" color="textSecondary">
              No Aadhar Front
            </MDTypography>
          )}

          {r.aadharCard?.back ? (
            <MDBox textAlign="center">
              <MDTypography variant="caption">Back</MDTypography>
              <img
                src={`${IMAGE_BASE}${r.aadharCard.back}`}
                width={120}
                style={{
                  borderRadius: 6,
                  display: "block",
                  marginTop: 4,
                  border: "1px solid #ddd",
                  padding: 4,
                }}
              />
            </MDBox>
          ) : (
            <MDTypography variant="body2" color="textSecondary">
              No Aadhar Back
            </MDTypography>
          )}
        </MDBox>

        <MDTypography fontWeight="bold" mb={1}>
          Driving Licence
        </MDTypography>

        <MDBox display="flex" gap={2} flexWrap="wrap">
          {r.drivingLicence?.front ? (
            <MDBox textAlign="center">
              <MDTypography variant="caption">Front</MDTypography>
              <img
                src={`${IMAGE_BASE}${r.drivingLicence.front}`}
                width={120}
                style={{
                  borderRadius: 6,
                  display: "block",
                  marginTop: 4,
                  border: "1px solid #ddd",
                  padding: 4,
                }}
              />
            </MDBox>
          ) : (
            <MDTypography variant="body2" color="textSecondary">
              No Licence Front
            </MDTypography>
          )}

          {r.drivingLicence?.back ? (
            <MDBox textAlign="center">
              <MDTypography variant="caption">Back</MDTypography>
              <img
                src={`${IMAGE_BASE}${r.drivingLicence.back}`}
                width={120}
                style={{
                  borderRadius: 6,
                  display: "block",
                  marginTop: 4,
                  border: "1px solid #ddd",
                  padding: 4,
                }}
              />
            </MDBox>
          ) : (
            <MDTypography variant="body2" color="textSecondary">
              No Licence Back
            </MDTypography>
          )}
        </MDBox>
      </Grid>
    </Grid>
  );

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2}>
      <MDBox px={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <div>
            <MDTypography variant="h5" fontWeight="bold">
              Driver Approval Requests
            </MDTypography>
          </div>

          <MDBox display="flex" gap={2}>
            <FormControl size="small">
              <InputLabel>Entries</InputLabel>
              <Select
                value={entriesToShow}
                label="Entries"
                onChange={(e) => setEntriesToShow(e.target.value)}
              >
                {[5, 10, 20, 30].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <MDInput
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </MDBox>
        </MDBox>

        <Card sx={{ p: 2 }}>
          <DataTable
            columns={columns}
            data={filtered}
            pagination
            paginationPerPage={entriesToShow}
            highlightOnHover
          />
        </Card>

        {/* View Modal */}
        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Driver Details</DialogTitle>
          <DialogContent>{selectedRequest && renderDetails(selectedRequest)}</DialogContent>
          <DialogActions>
            <MDButton onClick={() => setOpenViewDialog(false)}>Close</MDButton>
          </DialogActions>
        </Dialog>

        {/* Upload Modal */}
        <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Documents — {uploadDriver?.driverName}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Profile Image */}
              <Grid item xs={12}>
                <MDTypography>Profile Image</MDTypography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </Grid>

              {/* Aadhar Front */}
              <Grid item xs={12} sm={6}>
                <MDTypography>Aadhar Front</MDTypography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAadharFront(e.target.files[0])}
                />
              </Grid>

              {/* Aadhar Back */}
              <Grid item xs={12} sm={6}>
                <MDTypography>Aadhar Back</MDTypography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAadharBack(e.target.files[0])}
                />
              </Grid>

              {/* Licence Front */}
              <Grid item xs={12} sm={6}>
                <MDTypography>Driving Licence Front</MDTypography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDlFront(e.target.files[0])}
                />
              </Grid>

              {/* Licence Back */}
              <Grid item xs={12} sm={6}>
                <MDTypography>Driving Licence Back</MDTypography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDlBack(e.target.files[0])}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <MDButton onClick={() => setOpenUpload(false)}>Cancel</MDButton>
            <MDButton
              variant="contained"
              color="primary"
              disabled={uploading}
              onClick={handleUploadSubmit}
            >
              {uploading ? "Uploading…" : "Upload"}
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}
