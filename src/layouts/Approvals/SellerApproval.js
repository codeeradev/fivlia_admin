import React, { useEffect, useState, useMemo } from "react";
import { useMaterialUIController } from "context";
import Swal from "sweetalert2";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import DataTable from "react-data-table-component";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import TextField from "@mui/material/TextField";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function ApprovalRequests() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [sellerRequests, setSellerRequests] = useState([]);
  const [locationRequests, setLocationRequests] = useState([]);
  const [imageRequests, setImageRequests] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [brandRequests, setBrandRequests] = useState([]);
  const [sellerOfferRequests, setSellerOfferRequests] = useState([]);
  const [requestType, setRequestType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState({ type: "", id: "", status: "", note: "" });

  // Image base URL
  const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_LINK || "";

  // Status options with icons
  const statusOptions = {
    seller: [
      { value: "approved", label: "Accept", icon: CheckIcon },
      { value: "rejected", label: "Reject", icon: CloseIcon },
    ],
    location: [
      { value: "approved", label: "Accept", icon: CheckIcon },
      { value: "rejected", label: "Reject", icon: CloseIcon },
    ],
    image: [
      { value: "approved", label: "Accept", icon: CheckIcon },
      { value: "rejected", label: "Reject", icon: CloseIcon },
    ],
    product: [
      // { value: "pending_admin_approval", label: "Pending Admin Approval", icon: ScheduleIcon },
      { value: "approved", label: "Accept", icon: CheckIcon },
      { value: "rejected", label: "Reject", icon: CloseIcon },
      { value: "request_brand_approval", label: "Need Brand Approval", icon: LocalOfferIcon },
    ],
    brand: [
      // { value: "pending_admin_approval", label: "Pending Admin Approval", icon: ScheduleIcon },
      // { value: "request_brand_approval", label: "Need Brand Approval", icon: EditIcon },
      { value: "approved", label: "Accept", icon: VerifiedIcon },
      { value: "rejected", label: "Reject", icon: CloseIcon },
    ],
    sellerOffer: [
      { value: "approved", label: "Accept", icon: CheckIcon },
      { value: "rejected", label: "Reject", icon: CloseIcon },
    ],
  };

  // Status to icon mapping
  const statusToIcon = useMemo(
    () => ({
      pending: ScheduleIcon,
      pending_admin_approval: ScheduleIcon,
      request_brand_approval: LocalOfferIcon,
      submit_brand_approval: EditIcon,
      approved: CheckIcon,
      rejected: CloseIcon,
    }),
    []
  );

  // Status color mapping
  const statusToColor = useMemo(
    () => ({
      approved: "#2e7d32",
      rejected: "#d32f2f",
      pending: "#ed6c02",
      pending_admin_approval: "#ed6c02",
      request_brand_approval: "#0059ffff",
      submit_brand_approval: "#ed6c02",
    }),
    []
  );

  // Row color based on type
  const rowColor = (type) => {
    switch (type) {
      case "seller":
        return "#e3f2fd";
      case "location":
        return "#e8f5e9";
      case "image":
        return "#f3e5f5";
      case "product":
        return "#fffde7";
      case "brand":
        return "#fce4ec";
      case "sellerOffer":
        return "#e0f2f1";

      default:
        return "#fff";
    }
  };

  // Fetch all approval requests
  const fetchRequests = async () => {
    try {
      const res = await get(ENDPOINTS.GET_SELLER_REQUEST);
      const data = res.data;
      setSellerRequests((data.requests || []).map((r) => ({ ...r, type: "seller" })));
      setLocationRequests((data.locationRequests || []).map((r) => ({ ...r, type: "location" })));
      setImageRequests((data.imageRequest || []).map((r) => ({ ...r, type: "image" })));
      setProductRequests((data.productRequest || []).map((r) => ({ ...r, type: "product" })));
      setBrandRequests((data.brandRequest || []).map((r) => ({ ...r, type: "brand" })));
      setSellerOfferRequests(
        (data.sellerOfferRequest || []).map((r) => ({
          ...r,
          type: "sellerOffer",
        }))
      );
    } catch (e) {
      showAlert("error", "Failed to fetch requests.");
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handle status update
  const handleUpdateStatus = async () => {
    const { type, id, status, note } = selectedUpdate;
    try {
      let body = {};
      if (["seller", "location", "image", "sellerOffer"].includes(type)) {
        body.approval = status;
        if (type === "seller") {
          body.id = id;
        } else if (type === "sellerOffer") {
          body.couponId = id;
        } else if (type === "location") {
          body.id = id;
          body.isLocation = true;
        } else if (type === "image") {
          body.id = id;
          body.isImage = true;
        }
        if (note) body.description = note;
      } else {
        body.productId = id;
        body.approval = status;
        if (note) body.description = note;
      }

      await put(ENDPOINTS.APPROVAL_UPDATE, body);

      const statusLabel =
        status === "approved"
          ? "approved"
          : status === "rejected"
          ? "rejected"
          : status.replace(/_/g, " ");
      setSuccess(`Status updated to ${statusLabel} successfully.`);

      // Show success popup
      Swal.fire({
        icon: status === "approved" ? "success" : status === "rejected" ? "error" : "info",
        title:
          status === "approved"
            ? "Approved!"
            : status === "rejected"
            ? "Rejected!"
            : "Status Updated!",
        text: `The request has been ${statusLabel} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchRequests();
    } catch (e) {
      console.error(e);
      setError(e.message);

      // Show error popup
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: e.message || "Failed to update status. Please try again.",
      });
    } finally {
      setNoteOpen(false);
    }
  };

  // Combine and filter requests
  const allRequests = [
    ...sellerRequests,
    ...locationRequests,
    ...imageRequests,
    ...productRequests,
    ...brandRequests,
    ...sellerOfferRequests,
  ];

  const normalized = (v) => (v || "").toString().toLowerCase();
  const filtered = allRequests.filter((r) => {
    if (requestType !== "all" && r.type !== requestType) return false;

    let haystack = [];
    if (r.type === "seller" || r.type === "location" || r.type === "image") {
      haystack = [
        r.storeName,
        r.firstName,
        r.lastName,
        r.ownerName,
        r.email,
        r.mobileNumber,
        r.PhoneNumber,
        r.city?.name,
        r.gstNumber,
        r.approveStatus,
        r.type,
      ];
      if (r.type === "location") {
        haystack.push(r.pendingAddressUpdate?.city?.name, r.pendingAddressUpdate?.status);
      } else if (r.type === "image") {
        haystack.push(r.pendingAdvertisementImages?.status);
      }
    } else if (r.type === "sellerOffer") {
      haystack = [r.title, r.offer, r.limit, r.validDays, r.approvalStatus, r.type];
    } else if (r.type === "product" || r.type === "brand") {
      haystack = [
        r.productName,
        r.description,
        r.sku,
        r.category?.[0]?.name,
        r.subCategory?.[0]?.name,
        r.brand_Name?.name,
        r.sellerProductStatus,
        r.type,
      ];
      if (r.type === "brand") {
        haystack.push(r.brandApprovelDescription);
      }
    }
    return haystack.map(normalized).join(" ").includes(normalized(searchTerm));
  });
  const statusDisplayMap = {
    pending: "Pending",
    pending_admin_approval: "Pending Approval",
    request_brand_approval: "Brand Approval Needed",
    submit_brand_approval: "Brand Submitted",
    approved: "Approved",
    rejected: "Rejected",
  };

  const getStatus = (r) => {
    if (r.type === "sellerOffer") return r.approvalStatus || "pending";
    if (r.type === "seller") return r.approveStatus || "pending";
    if (r.type === "location") return r.pendingAddressUpdate?.status || "pending";
    if (r.type === "image") return r.pendingAdvertisementImages?.status || "pending";
    return r.sellerProductStatus || "pending";
  };

  const isPending = (r) => {
    const status = getStatus(r);
    return [
      "pending",
      "pending_admin_approval",
      "request_brand_approval",
      "submit_brand_approval",
    ].includes(status);
  };

  const getColumnHeading = (type, key) => {
    if (type === "sellerOffer") {
      const map = {
        name: "Offer Title",
        owner: "Discount",
        mobile: "Limit",
        email: "Validity",
        city: "Start Date",
        gst: "Image",
      };
      return map[key];
    }

    return {
      name: "Store / Product",
      owner: "Owner / Description",
      mobile: "Mobile / SKU",
      email: "Email / Category",
      city: "City / SubCategory",
      gst: "GST / Brand",
    }[key];
  };

  const getDisplayValue = (r, field) => {
    if (r.type === "seller" || r.type === "location" || r.type === "image") {
      switch (field) {
        case "name":
          return r.storeName || "-";
        case "owner":
          return [r.firstName, r.lastName].filter(Boolean).join(" ") || r.ownerName || "-";
        case "mobile":
          return r.PhoneNumber || r.mobileNumber?.mobileNO || "-";
        case "email":
          return r.email?.Email || r.email || "-";
        case "city":
          if (r.type === "location") {
            return `${r.city?.name || "-"} → ${r.pendingAddressUpdate?.city?.name || "-"}`;
          } else if (r.type === "image") {
            return r.city?.name || "-";
          }
          return r.city?.name || "-";
        case "gst":
          return r.gstNumber || "-";
        default:
          return "-";
      }
    }
    if (r.type === "sellerOffer") {
      switch (field) {
        case "name":
          return r.title;

        case "owner":
          return `${r.offer}% OFF`;

        case "mobile":
          return `Limit: ${r.limit}`;

        case "email":
          return `Valid ${r.validDays} days`;

        case "city":
          return new Date(r.fromTo).toLocaleDateString();

        case "gst":
          return (
            <MDBox display="flex" alignItems="center" gap={1}>
              {r.image && (
                <img
                  src={`${IMAGE_BASE_URL}${r.image}`}
                  alt="offer"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    objectFit: "cover",
                  }}
                />
              )}
            </MDBox>
          );
        default:
          return "-";
      }
    } else {
      switch (field) {
        case "name":
          return r.productName || "-";
        case "owner":
          return r.type === "brand" ? r.brandApprovelDescription || "-" : r.description || "-";
        case "mobile":
          return r.sku || "-";
        case "email":
          return r.category?.[0]?.name || "-";
        case "city":
          return r.subCategory?.[0]?.name || "-";
        case "gst":
          return r.brand_Name?.name || "-";
        default:
          return "-";
      }
    }
  };

  // DataTable columns
  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (row, idx) => filtered.indexOf(row) + 1,
        width: "80px",
        style: { justifyContent: "center" },
      },
      {
        name: "Type",
        selector: (row) => row.type.charAt(0).toUpperCase() + row.type.slice(1),
        width: "120px",
        style: { justifyContent: "center", fontWeight: "medium" },
      },
      {
        name: getColumnHeading(requestType, "name"),
        selector: (row) => getDisplayValue(row, "name"),
        width: "240px",
        wrap: true,
        style: { justifyContent: "center" },
      },
      {
        name: getColumnHeading(requestType, "owner"),
        selector: (row) => getDisplayValue(row, "owner"),
        width: "200px",
        wrap: true,
        style: { justifyContent: "center" },
      },
      {
        name: getColumnHeading(requestType, "mobile"),
        selector: (row) => getDisplayValue(row, "mobile"),
        width: "150px",
        wrap: true,
        style: { justifyContent: "center" },
      },
      {
        name: getColumnHeading(requestType, "email"),
        selector: (row) => getDisplayValue(row, "email"),
        width: "150px",
        wrap: true,
        style: { justifyContent: "center" },
      },
      {
        name: getColumnHeading(requestType, "city"),
        selector: (row) => getDisplayValue(row, "city"),
        width: "150px",
        wrap: true,
        style: { justifyContent: "center" },
      },
      {
        name: getColumnHeading(requestType, "gst"),
        selector: (row) => getDisplayValue(row, "gst"),
        width: "150px",
        wrap: true,
        style: { justifyContent: "center" },
      },
      {
        name: "Status",
        cell: (row) => {
          const status = getStatus(row);
          const displayStatus = statusDisplayMap[status] || status.replace(/_/g, " ");
          const color = statusToColor[status] || "#ed6c02";
          return (
            <Tooltip title={displayStatus} arrow>
              <MDTypography variant="body2" fontWeight="medium" sx={{ color }}>
                {displayStatus}
              </MDTypography>
            </Tooltip>
          );
        },
        width: "150px",
        style: {
          justifyContent: "center",
          fontWeight: "medium",
        },
      },
      {
        name: "Action",
        cell: (row) =>
          !isPending(row) ? (
            <Chip
              label={statusDisplayMap[getStatus(row)] || getStatus(row).replace(/_/g, " ")}
              color={
                getStatus(row) === "approved"
                  ? "success"
                  : getStatus(row) === "rejected"
                  ? "error"
                  : "default"
              }
              size="small"
              sx={{ fontWeight: "medium", textTransform: "capitalize" }}
            />
          ) : (
            <MDBox display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              {statusOptions[row.type].map(({ value, label, icon: Icon }) => {
                const color = statusToColor[value] || "#ed6c02";
                return (
                  <Tooltip key={value} title={label} arrow>
                    <MDBox
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={0.5}
                      onClick={() => {
                        setSelectedUpdate({
                          type: row.type,
                          id: row._id,
                          status: value,
                          note: "",
                        });
                        setNoteOpen(true);
                      }}
                      sx={{
                        cursor: "pointer",
                        p: 1,
                        borderRadius: 1,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Icon sx={{ color, fontSize: "1.75rem" }} />
                      <MDTypography
                        variant="caption"
                        sx={{ color, fontWeight: "medium", textAlign: "center" }}
                      >
                        {label}
                      </MDTypography>
                    </MDBox>
                  </Tooltip>
                );
              })}
            </MDBox>
          ),
        width: "300px",
        style: { justifyContent: "center" },
      },
      {
        name: "View",
        cell: (row) => (
          <IconButton
            onClick={() => {
              setSelectedRequest(row);
              setOpenDialog(true);
            }}
            color="primary"
          >
            <VisibilityIcon />
          </IconButton>
        ),
        width: "80px",
        style: { justifyContent: "center" },
      },
    ],
    [filtered, statusToIcon, statusToColor]
  );

  // DataTable custom styles
  const customStyles = {
    table: {
      style: {
        width: "100%",
        minWidth: "1000px",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#007bff",
        color: "white",
        fontWeight: 600,
        fontSize: "0.875rem",
      },
    },
    headCells: {
      style: {
        padding: "14px 16px",
        justifyContent: "center",
        textAlign: "center",
      },
    },
    cells: {
      style: {
        padding: "14px 16px",
        justifyContent: "center",
        textAlign: "center",
        wordBreak: "break-word",
        whiteSpace: "normal",
        fontSize: "0.9rem",
      },
    },
    rows: {
      style: {
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #ddd",
        },
      },
    },
  };

  // Detailed view for dialog
  const renderRequestDetails = (request) => {
    const { type } = request;

    if (type === "sellerOffer") {
      return (
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} md={6}>
            <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
              <MDTypography variant="h6" color="primary" gutterBottom>
                Offer Details
              </MDTypography>

              <MDTypography>
                <strong>Title:</strong> {request.title}
              </MDTypography>
              <MDTypography>
                <strong>Discount:</strong> {request.offer}%
              </MDTypography>
              <MDTypography>
                <strong>Limit:</strong> {request.limit}
              </MDTypography>
              <MDTypography>
                <strong>Valid Days:</strong> {request.validDays}
              </MDTypography>
              <MDTypography>
                <strong>Start Date:</strong> {new Date(request.fromTo).toLocaleDateString()}
              </MDTypography>
              <MDTypography>
                <strong>Status:</strong>{" "}
                <Chip
                  label={request.approvalStatus || "Pending"}
                  color={
                    request.approvalStatus === "approved"
                      ? "success"
                      : request.approvalStatus === "rejected"
                      ? "error"
                      : "warning"
                  }
                  size="small"
                />
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
              <MDTypography variant="h6" color="primary" gutterBottom>
                Offer Image
              </MDTypography>

              {request.image ? (
                <img
                  src={`${IMAGE_BASE_URL}${request.image}`}
                  alt="Offer"
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <MDTypography>No image uploaded</MDTypography>
              )}
            </MDBox>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={2} sx={{ p: 2 }}>
        {type === "seller" || type === "location" || type === "image" ? (
          <>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">
                  Store Information
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <MDTypography variant="body2">
                    <strong>Store Name:</strong> {request.storeName || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Owner:</strong> {request.ownerName || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Email:</strong> {request.email || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Phone:</strong> {request.PhoneNumber || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>GST:</strong> {request.gstNumber || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Address:</strong> {request.fullAddress || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>City:</strong> {request.city?.name || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Coordinates:</strong> {request.Latitude || "-"},{" "}
                    {request.Longitude || "-"}
                  </MDTypography>
                </MDBox>
                {type === "location" && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                      Location Update
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1}>
                      <MDTypography variant="body2">
                        <strong>New City:</strong> {request.pendingAddressUpdate?.city?.name || "-"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>New Zone:</strong>{" "}
                        {request.pendingAddressUpdate?.zone?.[0]?.name || "-"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>New Coordinates:</strong>{" "}
                        {request.pendingAddressUpdate?.Latitude || "-"},{" "}
                        {request.pendingAddressUpdate?.Longitude || "-"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>Requested On:</strong>{" "}
                        {request.pendingAddressUpdate?.requestedAt
                          ? new Date(request.pendingAddressUpdate.requestedAt).toLocaleDateString()
                          : "-"}
                      </MDTypography>
                    </MDBox>
                  </>
                )}
                {type === "image" && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                      Pending Advertisement Images
                    </MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={1}>
                      {request.pendingAdvertisementImages?.image?.map((img, i) => (
                        <img
                          key={i}
                          src={`${IMAGE_BASE_URL}${img}`}
                          alt={`Pending Image ${i + 1}`}
                          style={{ maxWidth: "150px", borderRadius: "4px" }}
                        />
                      ))}
                    </MDBox>
                    <MDTypography variant="body2" sx={{ mt: 1 }}>
                      <strong>Status:</strong>{" "}
                      <Chip
                        label={request.pendingAdvertisementImages?.status || "Pending"}
                        color={
                          request.pendingAdvertisementImages?.status === "approved"
                            ? "success"
                            : request.pendingAdvertisementImages?.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </MDTypography>
                  </>
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">
                  Verification Details
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <MDTypography variant="body2">
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={request.status ? "Active" : "Inactive"}
                      color={request.status ? "success" : "error"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Approval Status:</strong>{" "}
                    <Chip
                      label={
                        request.approveStatus ||
                        request.pendingAdvertisementImages?.status ||
                        "Pending"
                      }
                      color={
                        request.approveStatus === "approved" ||
                        request.pendingAdvertisementImages?.status === "approved"
                          ? "success"
                          : request.approveStatus === "rejected" ||
                            request.pendingAdvertisementImages?.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Authorized Store:</strong> {request.Authorized_Store ? "Yes" : "No"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Sell Food:</strong> {request.sellFood ? "Yes" : "No"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>FSI Number:</strong> {request.fsiNumber || "-"}
                  </MDTypography>
                </MDBox>
                {request.bankDetails && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                      Bank Details
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1}>
                      <MDTypography variant="body2">
                        <strong>Bank:</strong> {request.bankDetails.bankName || "-"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>Holder:</strong> {request.bankDetails.accountHolder || "-"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>Account No:</strong> {request.bankDetails.accountNumber || "-"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>IFSC:</strong> {request.bankDetails.ifsc || "-"}
                      </MDTypography>
                    </MDBox>
                  </>
                )}
              </MDBox>
              {(request.aadharCard?.length > 0 || request.image) && (
                <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm" sx={{ mt: 2 }}>
                  <MDTypography variant="h6" gutterBottom color="primary">
                    Documents
                  </MDTypography>
                  {request.aadharCard?.length > 0 && (
                    <MDBox mb={2}>
                      <MDTypography variant="body2">Aadhar Card:</MDTypography>
                      <MDBox display="flex" gap={1} flexWrap="wrap">
                        {request.aadharCard.slice(0, 2).map((img, i) => (
                          <img
                            key={i}
                            src={`${IMAGE_BASE_URL}${img}`}
                            alt="Aadhar"
                            style={{ maxWidth: "100px", borderRadius: "4px" }}
                          />
                        ))}
                        {request.aadharCard.length > 2 && (
                          <Chip label={`+${request.aadharCard.length - 2}`} size="small" />
                        )}
                      </MDBox>
                    </MDBox>
                  )}
                  {request.image && (
                    <MDBox>
                      <MDTypography variant="body2">Store Image:</MDTypography>
                      <img
                        src={`${IMAGE_BASE_URL}${request.image}`}
                        alt="Store"
                        style={{ maxWidth: "150px", borderRadius: "4px" }}
                      />
                    </MDBox>
                  )}
                </MDBox>
              )}
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">
                  Product Details
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <MDTypography variant="body2">
                    <strong>Name:</strong> {request.productName || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Description:</strong> {request.description || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>SKU:</strong> {request.sku || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Category:</strong> {request.category?.[0]?.name || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Subcategory:</strong> {request.subCategory?.[0]?.name || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Brand:</strong> {request.brand_Name?.name || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Tax:</strong> {request.tax || "-"}%
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Unit:</strong> {request.unit?.name || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={request.status ? "Active" : "Inactive"}
                      color={request.status ? "success" : "error"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Approval Status:</strong>{" "}
                    <Chip
                      label={request.sellerProductStatus || "Pending"}
                      color={
                        request.sellerProductStatus === "approved"
                          ? "success"
                          : request.sellerProductStatus === "rejected"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </MDTypography>
                  {request.brandApprovelDescription && (
                    <MDTypography variant="body2">
                      <strong>Notes:</strong> {request.brandApprovelDescription}
                    </MDTypography>
                  )}
                </MDBox>
                {request.variants && request.variants.length > 0 && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                      Variants
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1}>
                      {request.variants.slice(0, 2).map((v, i) => (
                        <MDBox key={i} p={1} border="1px solid #eee" borderRadius="sm">
                          <MDTypography variant="body2">
                            <strong>{v.attributeName}:</strong> {v.variantValue}
                          </MDTypography>
                          <MDTypography variant="body2">
                            <strong>MRP:</strong> ₹{v.mrp} | <strong>Sell:</strong> ₹{v.sell_price}{" "}
                            | <strong>Discount:</strong> {v.discountValue}%
                          </MDTypography>
                        </MDBox>
                      ))}
                      {request.variants.length > 2 && (
                        <Chip
                          label={`+${request.variants.length - 2} more`}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </MDBox>
                  </>
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">
                  Additional Details
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  {request.location?.[0] && (
                    <>
                      <MDTypography variant="body2">
                        <strong>City:</strong> {request.location[0].city?.[0]?.name || "-"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>Zone:</strong> {request.location[0].zone?.[0]?.name || "-"}
                      </MDTypography>
                    </>
                  )}
                  <MDTypography variant="body2">
                    <strong>Return Policy:</strong> {request.returnProduct?.title || "-"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Rating:</strong> {request.rating?.rate || 0} (
                    {request.rating?.users || 0} reviews)
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Purchases:</strong> {request.purchases || 0}
                  </MDTypography>
                  {request.inventory && request.inventory.length > 0 && (
                    <MDTypography variant="body2">
                      <strong>Stock:</strong>{" "}
                      {request.inventory.reduce((sum, inv) => sum + inv.quantity, 0)} units
                    </MDTypography>
                  )}
                </MDBox>
                {request.filter && request.filter.length > 0 && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                      Filters
                    </MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={1}>
                      {request.filter
                        .flatMap((f) => f.selected?.map((s) => s.name) || [])
                        .slice(0, 4)
                        .map((filter, i) => (
                          <Chip key={i} label={filter} size="small" />
                        ))}
                      {request.filter.flatMap((f) => f.selected || []).length > 4 && (
                        <Chip
                          label={`+${request.filter.flatMap((f) => f.selected || []).length - 4}`}
                          size="small"
                        />
                      )}
                    </MDBox>
                  </>
                )}
              </MDBox>
              {(request.productThumbnailUrl || request.productImageUrl?.length > 0) && (
                <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm" sx={{ mt: 2 }}>
                  <MDTypography variant="h6" gutterBottom color="primary">
                    Product Images
                  </MDTypography>
                  <MDBox display="flex" gap={1} flexWrap="wrap">
                    {request.productThumbnailUrl && (
                      <img
                        src={`${IMAGE_BASE_URL}${request.productThumbnailUrl}`}
                        alt="Thumbnail"
                        style={{ maxWidth: "80px", borderRadius: "4px" }}
                      />
                    )}
                    {request.productImageUrl?.slice(0, 2).map((url, i) => (
                      <img
                        key={i}
                        src={`${IMAGE_BASE_URL}${url}`}
                        alt={`Image ${i}`}
                        style={{ maxWidth: "80px", borderRadius: "4px" }}
                      />
                    ))}
                    {request.productImageUrl?.length > 2 && (
                      <Chip label={`+${request.productImageUrl.length - 2}`} size="small" />
                    )}
                  </MDBox>
                </MDBox>
              )}
              {request.type === "brand" && request.brandApprovalDocument && (
                <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm" sx={{ mt: 2 }}>
                  <MDTypography variant="h6" gutterBottom color="primary">
                    Brand Approval Document
                  </MDTypography>
                  <MDBox display="flex" gap={1} flexWrap="wrap">
                    <img
                      src={`${IMAGE_BASE_URL}${request.brandApprovalDocument}`}
                      alt="Brand Approval Document"
                      style={{ maxWidth: "150px", borderRadius: "4px" }}
                    />
                    <MDTypography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      Brand Approval Document
                    </MDTypography>
                  </MDBox>
                </MDBox>
              )}
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value, 10));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (e) => {
    setRequestType(e.target.value);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <MDBox width="100%" px={3}>
        <MDBox display="flex" justifyContent="space-between" mb={3} alignItems="center">
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">
              Approval Requests
            </MDTypography>
            <MDTypography variant="body2" color="textSecondary">
              Review and manage pending requests
            </MDTypography>
          </MDBox>
        </MDBox>

        <Card sx={{ p: 3, mb: 3 }}>
          <MDBox display="flex" gap={3} flexWrap="wrap" alignItems="center">
            <MDBox display="flex" alignItems="center" gap={1}>
              <MDTypography variant="body2" fontWeight="medium">
                Show Entries:
              </MDTypography>
              <FormControl size="medium" sx={{ minWidth: 120 }}>
                <InputLabel>Entries</InputLabel>
                <Select
                  value={entriesToShow}
                  onChange={handleEntriesChange}
                  label="Entries"
                  MenuProps={{
                    PaperProps: { style: { maxHeight: 250, minWidth: 120, fontSize: "1rem" } },
                  }}
                >
                  {[5, 10, 20, 30].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox display="flex" alignItems="center" gap={1}>
              <MDTypography variant="body2" fontWeight="medium">
                Filter by Type:
              </MDTypography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select value={requestType} onChange={handleTypeChange} label="Type">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="seller">Seller</MenuItem>
                  <MenuItem value="location">Location</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                  <MenuItem value="brand">Brand</MenuItem>
                  <MenuItem value="sellerOffer">Seller Offer</MenuItem>
                </Select>
              </FormControl>
            </MDBox>
            <MDBox ml="auto">
              <MDInput
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search: Store/Product, owner/desc, email/cat, mobile/sku..."
                size="small"
                sx={{ width: { xs: "100%", sm: 300 } }}
              />
            </MDBox>
          </MDBox>
        </Card>

        {error && (
          <MDBox mb={2} p={2} sx={{ bgcolor: "error.light", borderRadius: 1 }}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {success && (
          <MDBox mb={2} p={2} sx={{ bgcolor: "success.light", borderRadius: 1 }}>
            <MDTypography variant="body2" color="success">
              {success}
            </MDTypography>
          </MDBox>
        )}

        <Card sx={{ overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={filtered}
            pagination
            paginationPerPage={entriesToShow}
            paginationRowsPerPageOptions={[5, 10, 20, 30]}
            paginationComponentOptions={{
              rowsPerPageText: "Entries per page:",
              rangeSeparatorText: "of",
            }}
            customStyles={customStyles}
            conditionalRowStyles={[
              {
                when: (row) => true,
                style: (row) => ({
                  backgroundColor: rowColor(row.type),
                }),
              },
            ]}
            noDataComponent={
              <MDBox display="flex" sx={{ padding: "20px", justifyContent: "center" }}>
                <MDTypography variant="body2" color="textSecondary">
                  No requests found.
                </MDTypography>
              </MDBox>
            }
          />
        </Card>

        {/* View Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <MDTypography variant="h5">
              {selectedRequest?.type.charAt(0).toUpperCase() + selectedRequest?.type.slice(1)}{" "}
              Details
            </MDTypography>
          </DialogTitle>
          <DialogContent>{selectedRequest && renderRequestDetails(selectedRequest)}</DialogContent>
          <DialogActions>
            <MDButton
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(false)}
              sx={{ padding: "6px 12px" }}
            >
              Close
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Note Dialog for Status Update */}
        <Dialog open={noteOpen} onClose={() => setNoteOpen(false)}>
          <DialogTitle>
            <MDTypography variant="h5">
              Update Status to {selectedUpdate.status.replace(/_/g, " ")}
            </MDTypography>
          </DialogTitle>
          <DialogContent>
            <MDTypography variant="body2" mb={2}>
              Add a note (optional):
            </MDTypography>
            <TextField
              multiline
              rows={3}
              fullWidth
              label="Note"
              value={selectedUpdate.note}
              onChange={(e) => setSelectedUpdate({ ...selectedUpdate, note: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setNoteOpen(false)} sx={{ padding: "6px 12px" }}>
              Cancel
            </MDButton>
            <MDButton
              variant="contained"
              color="primary"
              onClick={handleUpdateStatus}
              sx={{ padding: "6px 12px" }}
            >
              Submit
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}
