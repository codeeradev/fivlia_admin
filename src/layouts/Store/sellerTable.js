import React, { useCallback, useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { showAlert } from "components/commonFunction/alertsLoader";
import { put, get, post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

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

const compactBodyCell = {
  ...bodyCell,
  minWidth: 150,
  whiteSpace: "nowrap",
};

const SELLER_TYPE_IDS = {
  FOOD: "69cf8a31ad92aee54ecb1e72",
  GROCERY: "69cf8a3fad92aee54ecb1e74",
  MALL: "69cf8a4bad92aee54ecb1e76",
};

const getTypeId = (store = {}) =>
  String(store.typeId?.$oid || store.typeId || "").trim();

const getSellerTypeMeta = (store = {}) => {
  const typeId = getTypeId(store);

  if (typeId === SELLER_TYPE_IDS.FOOD) {
    return {
      label: "Food Seller",
      segment: "Food Service",
      color: "#1b7f4c",
      bg: "#e8f7ef",
      border: "#b7e2c8",
    };
  }

  if (typeId === SELLER_TYPE_IDS.GROCERY) {
    return {
      label: "Grocery",
      segment: "Grocery & Essentials",
      color: "#7b5c00",
      bg: "#fff8e1",
      border: "#ffe082",
    };
  }

  if (typeId === SELLER_TYPE_IDS.MALL) {
    return {
      label: "Mall",
      segment: "Mall & Shopping",
      color: "#6a1b9a",
      bg: "#f3e5f5",
      border: "#ce93d8",
    };
  }

  // fallback for sellers without a typeId
  return {
    label: "Retail Partner",
    segment: "Commerce",
    color: "#3556a3",
    bg: "#edf2ff",
    border: "#c8d5ff",
  };
};

const isFoodSeller = (store = {}) => getTypeId(store) === SELLER_TYPE_IDS.FOOD;

const getRegistrationInfo = (store = {}) => {
  if (store.fsiNumber || store.fssaiNumber || store.fssai) {
    return {
      label: "FSSAI",
      value: store.fsiNumber || store.fssaiNumber || store.fssai,
      color: "#8a4b00",
      bg: "#fff4e5",
    };
  }

  if (store.gstNumber) {
    return {
      label: "GST",
      value: store.gstNumber,
      color: "#04566e",
      bg: "#e7f7fb",
    };
  }

  if (store.enrollmentId) {
    return {
      label: "Enrollment",
      value: store.enrollmentId,
      color: "#5d4777",
      bg: "#f3eefb",
    };
  }

  return {
    label: "Not Added",
    value: "-",
    color: "#666",
    bg: "#f5f5f5",
  };
};

function SellerTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sellerTypeFilter, setSellerTypeFilter] = useState("");
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionStore, setActionStore] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Pagination
  const [entries, setEntries] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    getAllStores();
  }, []);

  const handleAdminLogin = async (store) => {
    try {
      showAlert("loading", "Generating access key...");
      const response = await post(
        ENDPOINTS.GENERATE_KEY,
        {
          storeId: store._id,
          type: "admin",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-internal-key": process.env.REACT_APP_INTERNAL_API_KEY,
          },
        },
      );

      const data = await response.data;
      const generatedKey = data.accessKey;
      if (generatedKey) {
        showAlert("success", "Access key generated successfully");
        const redirectUrl = `${process.env.REACT_APP_SELLER_URL}/seller-login?t=adm&slr=${store._id}&k=${generatedKey}`;
        window.location.href = redirectUrl;
      } else if (response.status === 403) {
        showAlert("error", "Access denied.");
      } else {
        showAlert("error", "Failed to generate access key.");
      }
    } catch (error) {
      console.error("Error generating access key:", error);
      showAlert("error", "Server error while generating key.");
    }
  };

  const getAllStores = async () => {
    try {
      showAlert("loading", "Loading Sellers....");
      const result = await get(`${ENDPOINTS.GET_SELLER}?includeBanned=true`);
      const res = result.data;
      setStores(res.sellers || []);
      showAlert("info", "", 1);
    } catch (err) {
      console.log(err);
      showAlert("error", "Something went wrong");
    }
  };

  const handleFilter = useCallback(() => {
    let filtered = stores;

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.storeName?.toLowerCase().includes(lower) ||
          s.ownerName?.toLowerCase().includes(lower),
      );
    }

    if (selectedCity !== "") {
      filtered = filtered.filter(
        (s) => s.city?.name?.toLowerCase() === selectedCity.toLowerCase(),
      );
    }

    if (statusFilter !== "") {
      const isOnline = statusFilter === "online";
      filtered = filtered.filter((s) => s.status === isOnline);
    }

    if (sellerTypeFilter !== "") {
      filtered = filtered.filter((s) => getTypeId(s) === sellerTypeFilter);
    }

    setFilteredStores(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCity, statusFilter, sellerTypeFilter, stores]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  const handleActionClick = (event, store) => {
    setActionAnchorEl(event.currentTarget);
    setActionStore(store);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActionStore(null);
  };

  const handleBanToggle = async (storeId, newStatus) => {
    try {
      const approveStatus = newStatus ? "banned" : "approved";

      await put(`${ENDPOINTS.EDIT_STORE}/${storeId}`, { approveStatus });

      setStores((prevStores) =>
        prevStores.map((s) =>
          s._id === storeId ? { ...s, approveStatus } : s,
        ),
      );
    } catch (err) {
      console.error("Error updating ban status:", err);
      showAlert("error", "Error updating ban status");
    }
  };

  const handleStatusToggle = async (storeId, newStatus) => {
    try {
      await put(`${ENDPOINTS.EDIT_STORE}/${storeId}`, {
        status: newStatus,
      });

      setStores((prevStores) =>
        prevStores.map((s) =>
          s._id === storeId ? { ...s, status: newStatus } : s,
        ),
      );
    } catch (err) {
      showAlert("error", "Something went wrong while updating status.");
    }
  };

  const cityOptions = [
    ...new Set(stores.map((s) => s.city?.name).filter(Boolean)),
  ];

  const indexOfLast = currentPage * entries;
  const indexOfFirst = indexOfLast - entries;
  const paginatedStores = filteredStores.slice(indexOfFirst, indexOfLast);
  // const totalPages = Math.ceil(filteredStores.length / entries);

  return (
    <MDBox
      p={{ xs: 1, sm: 1.5, md: 2 }}
      sx={{
        ml: { xs: 0, lg: miniSidenav ? "80px" : "250px" },
        transition: "margin-left 0.3s ease",
      }}
    >
      <div className="city-container">
        <div
          className="add-city-box"
          style={{
            width: "100%",
            borderRadius: 15,
            padding: 20,
            overflowX: "auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <span style={{ fontWeight: "bold", fontSize: 26 }}>
                Sellers List
              </span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all stores</span>
            </div>

            <Button
              style={{
                backgroundColor: "#00c853",
                height: 45,
                width: 160,
                fontSize: 12,
                color: "white",
                letterSpacing: "1px",
              }}
              onClick={() => navigate("/create-store")}
            >
              + Create Seller
            </Button>
          </div>

          {/* ============================
              ⭐ INSERTED FILTERS SECTION 
              ============================ */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "10px",
            }}
          >
            {/* LEFT SIDE FILTERS */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {/* Show Entries */}
              <FormControl style={{ width: "120px", marginTop: "-4px" }}>
                <span style={{ fontSize: "12px" }}>Show Entries</span>
                <Select
                  value={entries}
                  onChange={(e) => {
                    setEntries(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ height: "45px" }}
                >
                  {[50, 100, 200, 400].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filter by City */}
              <FormControl style={{ minWidth: "180px", marginTop: "15px" }}>
                <InputLabel>Filter by City</InputLabel>
                <Select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{ height: "45px" }}
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {cityOptions.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filter by Status */}
              <FormControl style={{ minWidth: "180px", marginTop: "15px" }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ height: "45px" }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>

              {/* Filter by Seller Type */}
              <FormControl style={{ minWidth: "190px", marginTop: "15px" }}>
                <InputLabel>Seller Category</InputLabel>
                <Select
                  value={sellerTypeFilter}
                  onChange={(e) => setSellerTypeFilter(e.target.value)}
                  style={{ height: "45px" }}
                >
                  <MenuItem value="">All Sellers</MenuItem>
                  <MenuItem value={SELLER_TYPE_IDS.FOOD}>Food Sellers</MenuItem>
                  <MenuItem value={SELLER_TYPE_IDS.GROCERY}>Grocery</MenuItem>
                  <MenuItem value={SELLER_TYPE_IDS.MALL}>Mall</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* RIGHT SIDE SEARCH */}
            <TextField
              label="Search by Store/Owner"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "250px" }}
            />
          </div>

          {/* ======================
              ⭐ END FILTERS SECTION
              ====================== */}

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
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
                  <th style={headerCell}>Sr. No</th>
                  <th style={headerCell}>Seller Name</th>
                  <th style={headerCell}>Owner Info</th>
                  <th style={headerCell}>Wallet</th>
                  <th style={headerCell}>Business Segment</th>
                  <th style={headerCell}>Registration ID</th>
                  <th style={headerCell}>City</th>
                  <th style={headerCell}>Zone(s)</th>
                  <th style={headerCell}>Products</th>
                  <th style={headerCell}>Status</th>
                  <th style={headerCell}>Permanent Disable</th>
                  <th style={headerCell}>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedStores.map((store, index) => {
                  const sellerType = getSellerTypeMeta(store);
                  const registration = getRegistrationInfo(store);

                  return (
                    <tr key={store._id}>
                      <td style={{ ...bodyCell, textAlign: "center" }}>
                        {(currentPage - 1) * entries + index + 1}
                      </td>

                      <td style={bodyCell}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {store.image ? (
                            <img
                              src={`${process.env.REACT_APP_IMAGE_LINK}${store.image}`}
                              alt="store"
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 8,
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 8,
                                backgroundColor: "#ccc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#555",
                              }}
                            >
                              No Image
                            </div>
                          )}
                          <span style={{ marginLeft: "30px" }}>
                            {store.storeName}
                          </span>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td
                        style={bodyCell}
                        onClick={() => {
                          setSelectedStore(store);
                          setShowPassword(false);
                          setViewModalOpen(true);
                        }}
                      >
                        <strong style={{ cursor: "pointer", color: "#007bff" }}>
                          {store.ownerName || "N/A"}
                        </strong>
                      </td>

                      {/* Wallet */}
                      <td
                        style={{ ...bodyCell, textAlign: "left" }}
                        onClick={() => {
                          setSelectedStore(store);
                          setWalletModalOpen(true);
                        }}
                      >
                        <span
                          style={{
                            marginLeft: "30px",
                            color: "#007bff",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                        >
                          {(store.wallet ?? 0).toFixed(2)}
                        </span>
                      </td>

                      <td style={{ ...compactBodyCell, textAlign: "center" }}>
                        <Chip
                          label={sellerType.label}
                          size="small"
                          sx={{
                            minWidth: 116,
                            borderRadius: "8px",
                            fontWeight: 700,
                            color: sellerType.color,
                            backgroundColor: sellerType.bg,
                            border: `1px solid ${sellerType.border}`,
                          }}
                        />
                      </td>

                      <td style={{ ...compactBodyCell, minWidth: 190 }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            lineHeight: 1.2,
                          }}
                        >
                          <span
                            style={{
                              width: "fit-content",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              color: registration.color,
                              backgroundColor: registration.bg,
                            }}
                          >
                            {registration.label}
                          </span>
                          <span style={{ fontSize: 14, color: "#333" }}>
                            {registration.value}
                          </span>
                        </div>
                      </td>

                      <td style={bodyCell}>{store.city?.name || "N/A"}</td>
                      <td style={bodyCell}>{store.zone?.length || 0}</td>
                      <td style={bodyCell}>{store.Category?.length || 0}</td>

                      <td style={{ ...bodyCell, textAlign: "center" }}>
                        <Switch
                          checked={store.status}
                          onChange={(e) =>
                            handleStatusToggle(store._id, e.target.checked)
                          }
                          color="primary"
                        />
                      </td>

                      <td style={{ ...bodyCell, textAlign: "center" }}>
                        <Switch
                          checked={store.approveStatus === "banned"}
                          onChange={(e) =>
                            handleBanToggle(store._id, e.target.checked)
                          }
                          color="error"
                        />
                      </td>

                      <td style={{ ...bodyCell, textAlign: "center" }}>
                        <IconButton
                          onClick={(e) => handleActionClick(e, store)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>

                        <Menu
                          anchorEl={actionAnchorEl}
                          open={
                            Boolean(actionAnchorEl) &&
                            actionStore?._id === store._id
                          }
                          onClose={handleActionClose}
                        >
                          <MenuItem
                            onClick={async () => {
                              handleActionClose();
                              navigate("/edit-store", { state: { store } });
                            }}
                          >
                            Edit
                          </MenuItem>

                          <MenuItem
                            onClick={async () => {
                              handleActionClose();
                              await handleAdminLogin(store);
                            }}
                          >
                            Login
                          </MenuItem>
                        </Menu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wallet Modal */}
        {/* ✅ Wallet Modal */}
        <Dialog
          open={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          maxWidth={false}
          fullWidth
          PaperProps={{
            sx: {
              width: "95vw",
              maxWidth: "1200px",
              borderRadius: 3,
              padding: "10px 20px",
              overflow: "hidden",
            },
          }}
        >
          {/* ---- Header ---- */}
          <DialogTitle
            sx={{
              fontSize: 22,
              fontWeight: 700,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ddd",
              paddingBottom: 1,
            }}
          >
            Wallet Transactions — {selectedStore?.storeName || ""}
            <Button
              onClick={() => setWalletModalOpen(false)}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              Close
            </Button>
          </DialogTitle>

          {/* ---- Body ---- */}
          <DialogContent
            dividers
            sx={{
              padding: 0,
              maxHeight: "75vh",
              overflowY: "auto",
              mt: 1,
            }}
          >
            {selectedStore?.sellerWalletData?.length > 0 ? (
              <div style={{ width: "100%" }}>
                {/* ---- Header Row ---- */}
                <div
                  style={{
                    display: "flex",
                    fontWeight: 700,
                    backgroundColor: "#007bff",
                    color: "#fff",
                    padding: "12px 16px",
                    borderRadius: "6px 6px 0 0",
                    fontSize: 15,
                  }}
                >
                  <div style={{ flex: "1.4" }}>Date</div>
                  <div style={{ flex: "1" }}>Order ID</div>
                  <div style={{ flex: "0.8", textAlign: "center" }}>Type</div>
                  <div style={{ flex: "1", textAlign: "center" }}>
                    Amount (₹)
                  </div>
                  <div style={{ flex: "2", marginLeft: "20px" }}>
                    Description
                  </div>
                </div>

                {/* ---- Rows ---- */}
                {selectedStore.sellerWalletData.map((txn, index) => (
                  <div
                    key={txn._id || index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "12px 16px",
                      backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                      borderBottom: "1px solid #eee",
                      fontSize: 15,
                      lineHeight: 1.6,
                    }}
                  >
                    {/* Date */}
                    <div style={{ flex: "1.4" }}>
                      {new Date(txn.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* Order ID */}
                    <div style={{ flex: "1" }}>{txn.orderId || "—"}</div>

                    {/* Type */}
                    <div style={{ flex: "0.8", textAlign: "center" }}>
                      <Chip
                        label={txn.type}
                        color={txn.type === "Credit" ? "success" : "error"}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          minWidth: 70,
                          justifyContent: "center",
                        }}
                      />
                    </div>

                    {/* Amount */}
                    <div
                      style={{
                        flex: "1",
                        textAlign: "center",
                        color: txn.type === "Credit" ? "#2e7d32" : "#c62828",
                        fontWeight: 600,
                      }}
                    >
                      ₹{txn.amount.toFixed(2)}
                    </div>

                    {/* Description */}
                    <div
                      style={{
                        flex: "2",
                        textAlign: "left",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                        paddingRight: "10px",
                      }}
                    >
                      {txn.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#777",
                  padding: "20px 0",
                  fontSize: 16,
                }}
              >
                No wallet transactions found.
              </p>
            )}
          </DialogContent>
        </Dialog>

        {/* ✅ Owner Info Modal */}
        <Dialog
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Owner Info</DialogTitle>
          <DialogContent dividers>
            {selectedStore && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <TextField
                  label="Owner Name"
                  value={[selectedStore.firstName, selectedStore.lastName]
                    .filter(Boolean)
                    .join(" ")}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Phone Number"
                  value={
                    selectedStore.PhoneNumber ||
                    selectedStore.mobileNumber ||
                    ""
                  }
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="GST Number"
                  value={selectedStore.gstNumber || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={selectedStore.password || ""}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer", marginLeft: 8 }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    ),
                  }}
                />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewModalOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </MDBox>
  );
}

export default SellerTable;
