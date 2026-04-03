import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Chip,
  Popper,
  Paper,
  ClickAwayListener,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
} from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { getCities } from "components/commonApi/commonApi";
import { put, get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

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

function StoreTabel() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [stores, setStores] = useState([]);
  const [walletBalances, setWalletBalances] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedZones, setSelectedZones] = useState([]);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionStore, setActionStore] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityOptions, setCityOptions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    getAllStores();
    getWalletBalances();
    getAllCities();
  }, []);

  const getAllCities = async () => {
    try {
      const res = await getCities();
      const data = await res.data;
      if (data) {
        setCityOptions(data.map((c) => c.city));
      }
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  };

  useEffect(() => {
    const filtered = stores.filter((store) => {
      const matchesSearch =
        store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity ? store.city?.name === selectedCity : true;
      const matchesStatus = statusFilter === "" ? true : store.status?.toString() === statusFilter;
      return matchesSearch && matchesCity && matchesStatus;
    });
    setFilteredStores(filtered);
  }, [searchTerm, selectedCity, statusFilter, stores]);

  const [filteredStores, setFilteredStores] = useState([]);

  const getAllStores = async () => {
    try {
      showAlert("loading", "Loading Stores....")
      const result = await get(ENDPOINTS.GET_STORE);

      const res = await result.data;
      setStores(res.stores);
      showAlert("info","", 1)
    } catch (err) {
      console.log(err);
    }
  };

  const getWalletBalances = async () => {
    try {
      const result = await get(ENDPOINTS.WALLET_ADMIN);
      const res = await result.data;
      setWalletBalances(res.storeTotals);
    } catch (err) {
      console.log(err);
    }
  };

  const handleZonesClick = (event, zones) => {
    if (anchorEl && anchorEl === event.currentTarget) {
      setAnchorEl(null);
      setSelectedZones([]);
    } else {
      setAnchorEl(event.currentTarget);
      setSelectedZones(zones);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedZones([]);
  };

  const handleActionClick = (event, store) => {
    setActionAnchorEl(event.currentTarget);
    setActionStore(store);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActionStore(null);
  };

  const handleStatusToggle = async (storeId, newStatus) => {
    try {
      await put(`${ENDPOINTS.EDIT_STORE}/${storeId}`, {
        status: newStatus,
      });
        setStores((prevStores) =>
          prevStores.map((s) => (s._id === storeId ? { ...s, status: newStatus } : s))
        );

    } catch (err) {
      console.error(err);
      showAlert("error", "Something went wrong while updating status.");
    }
  };

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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Store List</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all stores</span>
            </div>
            <div>
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
                + Create Store
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
              background: "#f9f9f9",
              padding: "16px 20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {/* 🔍 Search Box */}
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <input
                type="text"
                placeholder="🔍 Search by Store or Owner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
            </div>

            {/* 🏙️ City Filter */}
            <div style={{ flex: "1 1 200px", position: "relative" }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  color: selectedCity ? "#000" : "#555",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="">🏙️ All Cities</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* 🌐 Status Filter */}
            <div style={{ flex: "1 1 200px", position: "relative" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  color: statusFilter ? "#000" : "#555",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="">🌐 All Status</option>
                <option value="true">🟢 Active</option>
                <option value="false">🔴 Inactive</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {(searchTerm || selectedCity || statusFilter) && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCity("");
                  setStatusFilter("");
                }}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  padding: "10px 18px",
                }}
              >
                Reset
              </Button>
            )}
          </div>

          <div style={{ width: "100%", overflowX: "auto", maxWidth: "100%" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                overflow: "hidden",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr>
                  <th style={headerCell}>Sr. No</th>
                  <th style={headerCell}>Store Name</th>
                  <th style={headerCell}>Owner Info</th>
                  <th style={headerCell}>City</th>
                  <th style={headerCell}>Zone(s)</th>
                  <th style={{ ...headerCell, width: "100px", textAlign: "center" }}>Products</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Wallet</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Status</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((store, index) => (
                  <tr key={store._id}>
                    <td style={{ ...bodyCell, textAlign: "center" }}>{index + 1}</td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {store.image ? (
                          <img
                            src={`${process.env.REACT_APP_IMAGE_LINK}${store.image}`}
                            alt="store"
                            style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }}
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
                              fontSize: 12,
                            }}
                          >
                            No Image
                          </div>
                        )}
                        <span style={{ marginLeft: "30px" }}>{store.storeName}</span>
                      </div>
                    </td>
                    <td style={bodyCell}>
                      <div
                        style={{
                          cursor: "pointer",
                          color: "#007bff",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          setSelectedStore(store);
                          setShowPassword(false);
                          setViewModalOpen(true);
                        }}
                      >
                        <strong>{store.ownerName || "N/A"}</strong>
                      </div>
                    </td>
                    <td style={bodyCell}>{store.city?.name || "N/A"}</td>
                    <td style={{ ...bodyCell, width: 140 }}>
                      {store.zone && store.zone.length > 0 ? (
                        <>
                          {store.zone.slice(0, 2).map((z) => (
                            <Chip
                              key={z._id}
                              label={z.title}
                              size="small"
                              style={{ marginRight: 4, marginBottom: 4 }}
                            />
                          ))}
                          {store.zone.length > 2 && (
                            <Button
                              size="small"
                              style={{ minWidth: 30, padding: "0 8px", textTransform: "none" }}
                              onClick={(e) => handleZonesClick(e, store.zone)}
                            >
                              +{store.zone.length - 2} more
                            </Button>
                          )}
                          <Popper
                            open={Boolean(anchorEl) && selectedZones === store.zone}
                            anchorEl={anchorEl}
                            placement="bottom-start"
                            style={{ zIndex: 1500 }}
                          >
                            <ClickAwayListener onClickAway={handleClose}>
                              <Paper style={{ padding: 10, maxWidth: 250 }}>
                                {selectedZones.map((z) => (
                                  <Chip
                                    key={z._id}
                                    label={z.title}
                                    size="small"
                                    style={{ margin: 2 }}
                                  />
                                ))}
                              </Paper>
                            </ClickAwayListener>
                          </Popper>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={bodyCell}>{store.Category?.length || 0}</td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <div
                        style={{
                          cursor: "pointer",
                          color: "#007bff",
                          textDecoration: "underline",
                        }}
                        onClick={() => navigate("/storeTransaction", { state: { id: store._id } })}
                      >
                        ₹{walletBalances[store._id]?.toFixed(2) || "0.00"}
                      </div>
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <Switch
                        checked={store.status}
                        onChange={(e) => handleStatusToggle(store._id, e.target.checked)}
                        color="primary"
                      />
                    </td>
                    <td style={{ ...bodyCell, width: 150, textAlign: "center" }}>
                      <IconButton onClick={(e) => handleActionClick(e, store)} size="small">
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={actionAnchorEl}
                        open={Boolean(actionAnchorEl) && actionStore?._id === store._id}
                        onClose={handleActionClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleActionClose();
                            navigate("/edit-store", { state: { store } });
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleActionClose();
                            localStorage.setItem("userType", "store");
                            localStorage.setItem("storeId", store._id);
                            window.location.href = "/dashboard1";
                          }}
                        >
                          Login
                        </MenuItem>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Owner Info Modal */}
        <Dialog
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Owner Info</DialogTitle>
          <DialogContent dividers>
            {selectedStore && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <TextField
                  label="Owner Name"
                  value={selectedStore.ownerName || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Phone Number"
                  value={selectedStore.PhoneNumber || selectedStore.phone || ""}
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

export default StoreTabel;
