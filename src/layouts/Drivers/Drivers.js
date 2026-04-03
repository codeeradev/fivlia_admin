import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Switch,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import db from "components/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import driverImg from "assets/images/driverFivlia.png";
import { get, post, put, del } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

export default function Drivers() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [walletBalances, setWalletBalances] = useState({}); // New state for wallet balances
  const [entriesToShow, setEntriesToShow] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editDriverData, setEditDriverData] = useState({
    driverName: "",
    status: false,
    email: "",
    password: "",
    vehicleRegistrationNumber: "",
    drivingLicenseNumber: "",
    image: null,
    Police_Verification_Copy: null,
    aadharCard: { front: null, back: null },
    drivingLicence: { front: null, back: null },
    address: { city: "", locality: "", mobileNo: "" },
  });
  const [searchLocation, setSearchLocation] = useState("");
  const [driverLocation, setDriverLocation] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralStores, setReferralStores] = useState([]);
  const [referralMessage, setReferralMessage] = useState("");
  const [referralError, setReferralError] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [driverRatings, setDriverRatings] = useState(null);
  const [ratingError, setRatingError] = useState("");

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

  const modalLabelStyle = {
    fontFamily: '"Urbanist", sans-serif',
    fontSize: "17px",
    fontWeight: "bold",
    color: "#333",
    marginRight: "8px",
  };

  const modalValueStyle = {
    fontFamily: '"Urbanist", sans-serif',
    fontSize: "16px",
    color: "#555",
  };

  const bikeIcon = L.icon({
    iconUrl: driverImg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const handleViewRating = async (driver) => {
    try {
      setSelectedDriver(driver);
      setRatingError("");
      setDriverRatings(null);

      const res = await get(`${ENDPOINTS.GET_DRIVER_RATING}/${driver.id}`);
      setDriverRatings(res.data);

      setRatingModalOpen(true);
    } catch (err) {
      console.error("Error fetching driver ratings:", err);
      setRatingError(err.message || "Failed to load ratings");
      setRatingModalOpen(true);
    }
  };

  const fetchDriverLocation = async (driverId) => {
    try {
      const docRef = doc(db, "updates", driverId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const location = {
          lat: data.latitude || 0,
          lng: data.longitude || 0,
        };
        return location;
      } else {
        console.log("No such driver location!");
        return null;
      }
    } catch (err) {
      console.error("Error fetching driver location:", err);
      return null;
    }
  };

  const handleTrackDriver = async (driver) => {
    const loc = await fetchDriverLocation(driver.id);
    if (loc) {
      setDriverLocation(loc);
      setSelectedDriver(driver);
      setMapModalOpen(true);
    } else {
      alert("Location not available");
    }
  };

  const handleViewReferrals = async (driver) => {
    try {
      setSelectedDriver(driver);
      setReferralError("");
      setReferralMessage("");
      setReferralStores([]);
      const res = await post(ENDPOINTS.GET_DRIVER_REFERRALS, {
        driverId: driver.driverId,
      });
      const data = res.data;
      setReferralMessage(data?.message || "");
      setReferralStores(Array.isArray(data?.stores) ? data.stores : []);
      setReferralModalOpen(true);
    } catch (e) {
      console.error("Failed to fetch referrals:", e);
      setReferralError(e.message || "Failed to fetch referrals");
      setReferralModalOpen(true);
    }
  };

  // Fetch wallet balances
  const fetchWalletBalances = async () => {
    try {
      const promises = drivers.map(async (driver) => {
        const res = await get(`${ENDPOINTS.GET_DRIVER_TRANSACTIONS}/${driver.id}`);
        const data = res.data;
        return { driverId: driver.id, totalAmount: data.totalAmount || 0 };
      });
      const balances = await Promise.all(promises);
      const balanceMap = balances.reduce((acc, { driverId, totalAmount }) => {
        acc[driverId] = totalAmount;
        return acc;
      }, {});
      setWalletBalances(balanceMap);
    } catch (err) {
      console.error("Failed to fetch wallet balances:", err);
      setError("Failed to fetch wallet balances. Please try again.");
    }
  };

  // Fetch drivers and wallet balances
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        showAlert("loading", "Loading drivers...");

        const res = await get(ENDPOINTS.GET_DRIVERS);
        const data = res.data;
        if (Array.isArray(data.Driver)) {
          const formattedDrivers = data.Driver.map((driver) => ({
            id: driver._id,
            name: driver.driverName || "",
            driverId: driver.driverId || "",
            status: driver.status === "true" || driver.status === true,
            email: driver.email || "",
            password: driver.password || "",
            image: driver.image || "",
            Police_Verification_Copy: driver.Police_Verification_Copy || "",
            aadharCard: driver.aadharCard || { front: "", back: "" },
            drivingLicence: driver.drivingLicence || { front: "", back: "" },
            vehicleRegistrationNumber: driver.vehicleRegistrationNumber || "",
            drivingLicenseNumber: driver.drivingLicenseNumber || "",
            address: driver.address || { city: "", locality: "", mobileNo: "" },
            averageRating: driver.averageRating || 0,
          }));
          formattedDrivers.sort((a, b) => {
            const aNum = Number(a.driverId.replace(/\D/g, "")) || 0;
            const bNum = Number(b.driverId.replace(/\D/g, "")) || 0;
            return bNum - aNum; // largest first
          });
          setDrivers(formattedDrivers);
          showAlert("info", "", 1);
        } else {
          setError("Invalid driver data format");
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
        setError("Failed to fetch drivers. Please try again.");
      }
    };

    // Fetch withdrawal requests
    const fetchWithdrawalRequests = async () => {
      try {
        const res = await get(ENDPOINTS.GET_WITHDRAWAL_REQUESTS);
        const data = res.data;
        if (Array.isArray(data.requests)) {
          const formattedRequests = data.requests.map((request) => ({
            id: request._id,
            driverId: request.driverId,
            amount: request.amount,
            type: request.type,
            description: request.description,
            status: request.status,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
          }));
          setWithdrawalRequests(formattedRequests);
        } else {
          setError("Invalid withdrawal requests data format");
        }
      } catch (error) {
        console.error("Failed to fetch withdrawal requests:", error);
        setError("Failed to fetch withdrawal requests. Please try again.");
      }
    };

    fetchDrivers();
    fetchWithdrawalRequests();
  }, []);

  // Fetch wallet balances when drivers change
  useEffect(() => {
    if (drivers.length > 0) {
      fetchWalletBalances();
    }
  }, [drivers]);

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDrivers.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

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

  const toggleStatus = async (id) => {
    const driverToUpdate = drivers.find((d) => d.id === id);
    if (!driverToUpdate) return;

    const newStatus = !driverToUpdate.status;

    try {
      showAlert("loading", "Updating status...");
      await put(`${ENDPOINTS.EDIT_DRIVER}/${id}`, { status: newStatus });

      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
      showAlert("info", "", 1);
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert("error", "Failed to update status");
    }
  };

  const handleDeleteDriver = async (id) => {
    const driverToDelete = drivers.find((d) => d.id === id);
    if (!driverToDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete driver "${
        driverToDelete.name || id
      }"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      showAlert("loading", "Deleting driver...");

      await del(`${ENDPOINTS.DELETE_DRIVER}/${id}`);

      setDrivers((prev) => prev.filter((d) => d.id !== id));

      if (selectedDriver?.id === id) {
        setSelectedDriver(null);
        setModalOpen(false);
      }
      showAlert("success", "Driver deleted");
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to delete driver");
    }
  };

  const handleEditDriver = async () => {
    if (!selectedDriver) {
      setError("No driver selected for editing.");
      return;
    }

    const formData = new FormData();
    formData.append("driverName", editDriverData.driverName);
    formData.append("status", editDriverData.status.toString());
    formData.append("email", editDriverData.email);
    formData.append("vehicleRegistrationNumber", editDriverData.vehicleRegistrationNumber);
    formData.append("drivingLicenseNumber", editDriverData.drivingLicenseNumber);
    if (editDriverData.password) {
      formData.append("password", editDriverData.password);
    }
    formData.append("address", JSON.stringify(editDriverData.address));

    if (editDriverData.image) {
      formData.append("image", editDriverData.image);
    }
    if (editDriverData.Police_Verification_Copy) {
      formData.append("Police_Verification_Copy", editDriverData.Police_Verification_Copy);
    }
    if (editDriverData.aadharCard.front) {
      formData.append("aadharCard", editDriverData.aadharCard.front);
    }
    if (editDriverData.aadharCard.back) {
      formData.append("aadharCard", editDriverData.aadharCard.back);
    }
    if (editDriverData.drivingLicence.front) {
      formData.append("drivingLicence", editDriverData.drivingLicence.front);
    }
    if (editDriverData.drivingLicence.back) {
      formData.append("drivingLicence", editDriverData.drivingLicence.back);
    }

    try {
      const res = await put(`${ENDPOINTS.EDIT_DRIVER}/${selectedDriver.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data;
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === updated.edit._id
            ? {
                ...d,
                name: updated.edit.driverName || d.name,
                status: updated.edit.status === "true" || updated.edit.status === true,
                email: updated.edit.email || d.email,
                password: updated.edit.password || d.password,
                image: updated.edit.image || d.image,
                Police_Verification_Copy:
                  updated.edit.Police_Verification_Copy || d.Police_Verification_Copy,
                aadharCard: updated.edit.aadharCard || d.aadharCard,
                drivingLicence: updated.edit.drivingLicence || d.drivingLicence,
                address: updated.edit.address || d.address,
              }
            : d
        )
      );

      setEditModalOpen(false);
      setSelectedDriver(null);
      setEditDriverData({
        driverName: "",
        status: false,
        email: "",
        password: "",
        image: null,
        Police_Verification_Copy: null,
        aadharCard: { front: null, back: null },
        drivingLicence: { front: null, back: null },
        address: { city: "", locality: "", mobileNo: "" },
      });
      setError("");
    } catch (error) {
      console.error("Error updating driver:", error);
      showAlert("error", error.message || "Failed to update driver");
    }
  };

  // Handle Accept/Decline Withdrawal Request
  const handleWithdrawalAction = async (requestId, action) => {
    try {
      await put(`${ENDPOINTS.WITHDRAWAL_ACTION}/${requestId}/${action}`);

      setWithdrawalRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: action === "accept" ? "Approved" : "Declined" }
            : req
        )
      );
      showAlert("success", "Request updated");
    } catch (error) {
      console.error(`Error ${action}ing withdrawal request:`, error);
      showAlert("error", "Failed to update request");
    }
  };

  const handleOpenEditModal = (driver) => {
    setSelectedDriver(driver);
    setEditDriverData({
      driverName: driver.name,
      status: driver.status,
      email: driver.email,
      password: "",
      vehicleRegistrationNumber: driver.vehicleRegistrationNumber || "",
      drivingLicenseNumber: driver.drivingLicenseNumber || "",
      image: null,
      Police_Verification_Copy: null,
      aadharCard: { front: null, back: null },
      drivingLicence: { front: null, back: null },
      address: {
        city: driver.address?.city || "",
        locality: driver.address?.locality || "",
        mobileNo: driver.address?.mobileNo || "",
      },
    });
    setEditModalOpen(true);
  };

  const handleOpenImageModal = (image) => {
    setSelectedImage(image);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Driver List</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              View and manage all drivers
            </p>
          </div>
          <Button
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 150,
              fontSize: 12,
              color: "white",
              letterSpacing: "1px",
            }}
            onClick={() => navigate("/add-driver")}
          >
            + Add Driver
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
              {[50, 100, 200, 400].map((num) => (
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
                placeholder="Search drivers..."
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
        <div
          style={{
            overflowX: "auto", // <-- horizontal scroll
          }}
        >
          {error && (
            <div style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</div>
          )}

          <table
            style={{
              width: "100%",
              minWidth: "1400px",
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
                <th style={headerCell}>Driver ID </th>
                <th style={headerCell}>Driver Name</th>
                <th style={headerCell}>City</th>
                <th style={headerCell}>Email</th>
                <th style={headerCell}>Mobile No</th>
                <th style={headerCell}>Wallet</th>
                <th style={headerCell}>Rating</th>
                <th style={headerCell}>Referrals</th>
                <th style={headerCell}>Details</th>
                <th style={headerCell}>Permanent Disable</th>
                <th style={headerCell}>Action</th>
                <th style={headerCell}>Locate</th>
              </tr>
            </thead>
            <tbody>
              {currentDrivers.length > 0 ? (
                currentDrivers.map((driver, index) => (
                  <tr
                    key={driver.id}
                    style={{
                      backgroundColor: selectedDriver?.id === driver.id ? "#f1f1f1" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + index + 1}</td>
                    <td style={bodyCell}>{driver.driverId}</td>
                    <td style={{ ...bodyCell, display: "flex", alignItems: "center", gap: "10px" }}>
                      <Avatar
                        src={`${process.env.REACT_APP_IMAGE_LINK}${driver.image}`}
                        alt={driver.name}
                        sx={{ width: 40, height: 40 }}
                      />
                      <span>{driver.name}</span>
                    </td>
                    <td style={bodyCell}>{driver.address.city || "-"}</td>
                    <td style={bodyCell}>{driver.email || "-"}</td>
                    <td style={bodyCell}>{driver.address?.mobileNo || "-"}</td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <div
                        style={{
                          cursor: "pointer",
                          color: "#007bff",
                          textDecoration: "underline",
                        }}
                        onClick={() =>
                          navigate("/driverTransaction", { state: { driverId: driver.id } })
                        }
                      >
                        ₹{walletBalances[driver.id]?.toFixed(2) || "0.00"}
                      </div>
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <div
                        onClick={() => handleViewRating(driver)}
                        style={{
                          cursor: "pointer",
                          color: "#ff9800",
                          fontWeight: "bold",
                          textDecoration: "underline",
                        }}
                      >
                        ⭐ {driver.averageRating?.toFixed(2) || "0.00"}
                      </div>
                    </td>

                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <button
                        onClick={() => handleViewReferrals(driver)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #007bff",
                          backgroundColor: "white",
                          color: "#007bff",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        View
                      </button>
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setSearchLocation(driver.address?.locality || driver.address?.city || "");
                          setModalOpen(true);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #007bff",
                          backgroundColor: "white",
                          color: "#007bff",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <Switch
                        checked={driver.status}
                        onChange={() => toggleStatus(driver.id)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: "green" },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "green !important",
                          },
                          "& .MuiSwitch-track": { backgroundColor: "red", opacity: 1 },
                        }}
                      />
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleOpenEditModal(driver)}
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
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <button
                        onClick={() => handleTrackDriver(driver)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #007bff",
                          backgroundColor: "white",
                          color: "#007bff",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                    No drivers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredDrivers.length)} of{" "}
            {filteredDrivers.length} entries
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

      <Dialog open={mapModalOpen} onClose={() => setMapModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Driver Location - {selectedDriver?.name}</DialogTitle>
        <DialogContent>
          {driverLocation ? (
            <div style={{ height: "400px", width: "100%" }}>
              <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={bikeIcon}>
                  <Popup>{selectedDriver?.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <Typography>No location data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Driver Details
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          {selectedDriver ? (
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 300px" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Urbanist", sans-serif',
                    fontSize: "18px",
                    marginBottom: "16px",
                  }}
                >
                  Personal Information
                </Typography>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                  <span style={modalLabelStyle}>📧 Email:</span>
                  <span style={modalValueStyle}>{selectedDriver.email || "Not provided"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                  <span style={modalLabelStyle}>🔒 Password:</span>
                  <span style={{ ...modalValueStyle, marginLeft: "8px" }}>
                    {showPassword ? selectedDriver.password || "Not provided" : "••••••••"}
                  </span>
                  <IconButton
                    onClick={togglePasswordVisibility}
                    size="small"
                    sx={{ marginLeft: "8px" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </div>
                <Divider sx={{ margin: "16px 0" }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Urbanist", sans-serif',
                    fontSize: "18px",
                    marginBottom: "16px",
                  }}
                >
                  Address
                </Typography>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                  <span style={modalLabelStyle}>📍 City:</span>
                  <span style={modalValueStyle}>
                    {selectedDriver.address?.city || "Not provided"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                  <span style={modalLabelStyle}>🏠 Locality:</span>
                  <span style={modalValueStyle}>
                    {selectedDriver.address?.locality || "Not provided"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                  <span style={modalLabelStyle}>📞 Mobile:</span>
                  <span style={modalValueStyle}>
                    {selectedDriver.address?.mobileNo || "Not provided"}
                  </span>
                </div>
                <TextField
                  label="Search Location"
                  fullWidth
                  margin="normal"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  sx={{ marginTop: "16px" }}
                />
              </div>

              <div style={{ flex: "1 1 400px" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Urbanist", sans-serif',
                    fontSize: "18px",
                    marginBottom: "16px",
                  }}
                >
                  Documents
                </Typography>
                <div style={{ marginBottom: "24px" }}>
                  <span style={modalLabelStyle}>🗂️ Police Verification Copy:</span>
                  {selectedDriver.Police_Verification_Copy ? (
                    selectedDriver.Police_Verification_Copy.endsWith(".pdf") ? (
                      <a
                        href={`${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.Police_Verification_Copy}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff", textDecoration: "underline", fontSize: "16px" }}
                      >
                        View PDF
                      </a>
                    ) : (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.Police_Verification_Copy}`}
                        alt="Police Verification"
                        style={{
                          maxWidth: "350px",
                          maxHeight: "350px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          marginTop: "8px",
                          transition: "transform 0.2s",
                        }}
                        onClick={() =>
                          handleOpenImageModal(
                            `${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.Police_Verification_Copy}`
                          )
                        }
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    )
                  ) : (
                    <span style={modalValueStyle}>Not provided</span>
                  )}
                </div>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Urbanist", sans-serif',
                    fontSize: "18px",
                    marginBottom: "16px",
                  }}
                >
                  Aadhar Card
                </Typography>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <span style={modalLabelStyle}>🆔 Front:</span>
                    {selectedDriver.aadharCard?.front ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.aadharCard.front}`}
                        alt="Aadhar Card Front"
                        style={{
                          maxWidth: "350px",
                          maxHeight: "350px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          marginTop: "8px",
                          transition: "transform 0.2s",
                        }}
                        onClick={() =>
                          handleOpenImageModal(
                            `${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.aadharCard.front}`
                          )
                        }
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    ) : (
                      <span style={modalValueStyle}>Not provided</span>
                    )}
                  </div>
                  <div>
                    <span style={modalLabelStyle}>🆔 Back:</span>
                    {selectedDriver.aadharCard?.back ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.aadharCard.back}`}
                        alt="Aadhar Card Back"
                        style={{
                          maxWidth: "350px",
                          maxHeight: "350px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          marginTop: "8px",
                          transition: "transform 0.2s",
                        }}
                        onClick={() =>
                          handleOpenImageModal(
                            `${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.aadharCard.back}`
                          )
                        }
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    ) : (
                      <span style={modalValueStyle}>Not provided</span>
                    )}
                  </div>
                </div>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Urbanist", sans-serif',
                    fontSize: "18px",
                    marginBottom: "16px",
                  }}
                >
                  Driving Licence
                </Typography>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <span style={modalLabelStyle}>🚗 Front:</span>
                    {selectedDriver.drivingLicence?.front ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.drivingLicence.front}`}
                        alt="Driving Licence Front"
                        style={{
                          maxWidth: "350px",
                          maxHeight: "350px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          marginTop: "8px",
                          transition: "transform 0.2s",
                        }}
                        onClick={() =>
                          handleOpenImageModal(
                            `${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.drivingLicence.front}`
                          )
                        }
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    ) : (
                      <span style={modalValueStyle}>Not provided</span>
                    )}
                  </div>
                  <div>
                    <span style={modalLabelStyle}>🚗 Back:</span>
                    {selectedDriver.drivingLicence?.back ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.drivingLicence.back}`}
                        alt="Driving Licence Back"
                        style={{
                          maxWidth: "350px",
                          maxHeight: "350px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          marginTop: "8px",
                          transition: "transform 0.2s",
                        }}
                        onClick={() =>
                          handleOpenImageModal(
                            `${process.env.REACT_APP_IMAGE_LINK}${selectedDriver.drivingLicence.back}`
                          )
                        }
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    ) : (
                      <span style={modalValueStyle}>Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Typography sx={modalValueStyle}>No details available.</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setModalOpen(false)}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Referrals {selectedDriver ? `- ${selectedDriver.name}` : ""}
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          {referralError && (
            <Typography
              color="error"
              sx={{ marginBottom: "12px", fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}
            >
              No referral records were found for this driver.
            </Typography>
          )}
          {/* {referralMessage && (
            <Typography sx={{ marginBottom: "12px", fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}>
              {referralMessage}
            </Typography>
          )} */}
          {referralStores && referralStores.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: '"Urbanist", sans-serif',
                fontSize: "16px",
                borderBottom: "1px solid #f1f1f1",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...headerCell,
                      backgroundColor: "#f4f4f4",
                      color: "Black",
                      fontSize: 16,
                    }}
                  >
                    Store Name
                  </th>
                  <th
                    style={{
                      ...headerCell,
                      backgroundColor: "#f4f4f4",
                      color: "Black",
                      fontSize: 16,
                    }}
                  >
                    City
                  </th>
                  <th
                    style={{
                      ...headerCell,
                      backgroundColor: "#f4f4f4",
                      color: "Black",
                      fontSize: 16,
                    }}
                  >
                    Phone
                  </th>
                  <th
                    style={{
                      ...headerCell,
                      backgroundColor: "#f4f4f4",
                      color: "Black",
                      fontSize: 16,
                    }}
                  >
                    Email
                  </th>
                  {/* <th style={{ ...headerCell,backgroundColor: "#f4f4f4",color:'Black', fontSize: 16 }}>Status</th>
                  <th style={{ ...headerCell,backgroundColor: "#f4f4f4",color:'Black', fontSize: 16 }}>Approve Status</th> */}
                  <th
                    style={{
                      ...headerCell,
                      backgroundColor: "#f4f4f4",
                      color: "Black",
                      fontSize: 16,
                    }}
                  >
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody>
                {referralStores.map((s) => (
                  <tr key={s._id}>
                    <td style={{ ...bodyCell, color: "Black" }}>{s.storeName || "-"}</td>
                    <td style={{ ...bodyCell, color: "Black" }}>{s.city || "-"}</td>
                    <td style={{ ...bodyCell, color: "Black" }}>{s.PhoneNumber || "-"}</td>
                    <td style={{ ...bodyCell, color: "Black" }}>{s.email || "-"}</td>
                    {/* <td style={{...bodyCell,color:'Black'}}>{String(s.status)}</td>
                    <td style={{...bodyCell,color:'Black'}}>{s.approveStatus || '-'}</td> */}
                    <td style={{ ...bodyCell, color: "Black" }}>Rs.{Number(s.commission || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !referralError && (
              <Typography sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}>
                No referrals found.
              </Typography>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setReferralModalOpen(false)}
            color="primary"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imageModalOpen} onClose={handleCloseImageModal} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Image Preview
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full-size preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={handleCloseImageModal}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Edit Driver
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px" }}>
          {error && (
            <Typography
              color="error"
              sx={{ marginBottom: "16px", fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}
            >
              {error}
            </Typography>
          )}
          <TextField
            label="Driver Name"
            fullWidth
            margin="normal"
            value={editDriverData.driverName}
            onChange={(e) => setEditDriverData((prev) => ({ ...prev, driverName: e.target.value }))}
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={editDriverData.email}
            onChange={(e) => setEditDriverData((prev) => ({ ...prev, email: e.target.value }))}
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Vehicle Registration Number"
            fullWidth
            margin="normal"
            value={editDriverData.vehicleRegistrationNumber}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                vehicleRegistrationNumber: e.target.value,
              }))
            }
          />

          <TextField
            label="Driving License Number"
            fullWidth
            margin="normal"
            value={editDriverData.drivingLicenseNumber}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                drivingLicenseNumber: e.target.value,
              }))
            }
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={editDriverData.password}
            onChange={(e) => setEditDriverData((prev) => ({ ...prev, password: e.target.value }))}
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={editDriverData.address.city}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                address: { ...prev.address, city: e.target.value },
              }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Locality"
            fullWidth
            margin="normal"
            value={editDriverData.address.locality}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                address: { ...prev.address, locality: e.target.value },
              }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Mobile Number"
            fullWidth
            margin="normal"
            value={editDriverData.address.mobileNo}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                address: { ...prev.address, mobileNo: e.target.value },
              }))
            }
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]*", // Enforce numeric input
              inputMode: "numeric", // Show numeric keyboard on mobile devices
            }}
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={editDriverData.status}
                onChange={(e) =>
                  setEditDriverData((prev) => ({ ...prev, status: e.target.checked }))
                }
              />
            }
            label="Active Status"
            sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}
          />
          <TextField
            label="Profile Image"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) => setEditDriverData((prev) => ({ ...prev, image: e.target.files[0] }))}
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Police Verification Copy"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*,application/pdf" }}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                Police_Verification_Copy: e.target.files[0],
              }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Aadhar Card (Front)"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                aadharCard: { ...prev.aadharCard, front: e.target.files[0] },
              }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Aadhar Card (Back)"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                aadharCard: { ...prev.aadharCard, back: e.target.files[0] },
              }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Driving Licence (Front)"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                drivingLicence: { ...prev.drivingLicence, front: e.target.files[0] },
              }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Driving Licence (Back)"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) =>
              setEditDriverData((prev) => ({
                ...prev,
                drivingLicence: { ...prev.drivingLicence, back: e.target.files[0] },
              }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditDriver}
            color="primary"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Driver Ratings {selectedDriver ? `- ${selectedDriver.name}` : ""}
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          {ratingError && (
            <Typography
              color="error"
              sx={{ marginBottom: "12px", fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}
            >
              {ratingError}
            </Typography>
          )}

          {driverRatings ? (
            <>
              <Typography
                sx={{
                  fontFamily: '"Urbanist", sans-serif',
                  fontSize: "18px",
                  marginBottom: "16px",
                  fontWeight: "bold",
                }}
              >
                ⭐ Average Rating: {driverRatings.averageRating} ({driverRatings.totalRatings}{" "}
                Reviews)
              </Typography>

              {driverRatings.reviews.length > 0 ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: '"Urbanist", sans-serif',
                    fontSize: "16px",
                    border: "1px solid #eee",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ ...headerCell, backgroundColor: "#f5f5f5", color: "black" }}>
                        User
                      </th>
                      <th style={{ ...headerCell, backgroundColor: "#f5f5f5", color: "black" }}>
                        Order
                      </th>
                      {/* <th style={{ ...headerCell, backgroundColor: "#f5f5f5", color: "black" }}>
                        Product
                      </th> */}
                      <th style={{ ...headerCell, backgroundColor: "#f5f5f5", color: "black" }}>
                        Rating
                      </th>
                      <th style={{ ...headerCell, backgroundColor: "#f5f5f5", color: "black" }}>
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverRatings.reviews.map((r) => (
                      <tr key={r._id}>
                        <td style={bodyCell}>
                          {r.user ? (
                            <>
                              <div style={{ fontWeight: "bold" }}>{r.user.name}</div>
                              <div style={{ fontSize: "14px", color: "#777" }}>
                                {r.user.mobileNumber || r.user.email}
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={bodyCell}>{r.order?.orderId || "-"}</td>
                        {/* <td style={bodyCell}>
                          {r.order?.items?.length > 0
                            ? r.order.items[0].product?.name || r.order.items[0].name
                            : "-"}
                        </td> */}
                        <td style={{ ...bodyCell, textAlign: "center" }}>⭐ {r.rating}</td>
                        <td style={bodyCell}>{r.message || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}>
                  No reviews available for this driver.
                </Typography>
              )}
            </>
          ) : (
            !ratingError && (
              <Typography sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "16px" }}>
                Loading ratings...
              </Typography>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setRatingModalOpen(false)}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
