import React, { useEffect, useRef, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import "./AddStore.css";
import { Button, Switch } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Marker, Circle } from "@react-google-maps/api"; // works for Ola via AdaptiveMap
import AdaptiveMap from "../../components/Maps/AdaptiveMap";
import { useMapsApi } from "../../hooks/useMapsApi";
import { showAlert } from "components/commonFunction/alertsLoader";
import { getMainCategories, getAllZones } from "components/commonApi/commonApi";

// Shared api client & endpoints
import { post, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

function AddStore() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const { apiType } = useMapsApi();
  // Form states
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");

  const [gstNumber, setGstNumber] = useState("");
  const [fsiNumber, setFsiNumber] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [markerPosition, setMarkerPosition] = useState({ lat: 29.1492, lng: 75.7217 });
  const [range, setRange] = useState(3);
  const [selectedZone, setSelectedZone] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [des, setDescription] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAssured, setAssured] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [cities, setCities] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);

  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstance = useRef(null);

  const location = useLocation();
  const storedetails = location.state;
  const [id, setId] = useState("");

  useEffect(() => {
    if (storedetails && storedetails.store) {
      const zoneIds = Array.isArray(storedetails?.store?.zone)
        ? storedetails.store.zone.map((zone) => zone._id)
        : [];
      setId(storedetails.store._id);
      setStoreName(storedetails.store.storeName);
      setOwnerName(storedetails.store.ownerName);

      setGstNumber(storedetails.store.gstNumber);
      setFsiNumber(storedetails.store.fsiNumber);

      setEnrollmentId(storedetails.store.enrollmentId);
      setInvoicePrefix(storedetails.store.invoicePrefix);

      setPhone(storedetails.store.PhoneNumber);
      setEmail(storedetails.store.email || "");
      setPassword(storedetails.store.password);
      setSelectedCity(storedetails.store.city?._id);
      setSelectedZone(zoneIds);
      setLatitude(storedetails.store.Latitude);
      setLongitude(storedetails.store.Longitude);
      setDescription(storedetails.store.Description);
      setIsAuthorized(storedetails.store.Authorized_Store);
      setAssured(storedetails.store.fivliaAssured);
      setSelectedImage(storedetails.store.image);
      setSelectedCategory(storedetails.store.Category);
      setOpenTime(storedetails.store.openTime || "");
      setCloseTime(storedetails.store.closeTime || "");
      if (storedetails.store.Latitude && storedetails.store.Longitude) {
        setMarkerPosition({
          lat: parseFloat(storedetails.store.Latitude),
          lng: parseFloat(storedetails.store.Longitude),
        });
      }
    }
  }, []);

  useEffect(() => {
    const getMainCategory = async () => {
      try {
        const res = await getMainCategories();
        if (res.status === 200) {
          const result = await res.data;
          setMainCategories(result.result);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const fetchCities = async () => {
      try {
        const res = await getAllZones();
        const data = res.data;
        if (data) {
          setCities(data);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    getMainCategory();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      const cityObj = cities.find((c) => c._id === selectedCity);
      if (cityObj && Array.isArray(cityObj.zones)) {
        setAvailableZones(cityObj.zones);
      } else {
        setAvailableZones([]);
      }
      setSelectedZone([]);
    } else {
      setAvailableZones([]);
      setSelectedZone([]);
    }
  }, [selectedCity, cities]);

  const handleMapClick = (e) => {
    let lat, lng;

    if (typeof e.lat === "number" && typeof e.lng === "number") {
      // Ola click
      lat = e.lat;
      lng = e.lng;
    } else if (e?.latLng) {
      // Google click fallback
      lat = e.latLng.lat();
      lng = e.latLng.lng();
    }

    if (lat && lng) {
      setMarkerPosition({ lat, lng });
      setLatitude(lat.toString());
      setLongitude(lng.toString());
    }
  };

  const handleSwitchChange = (event) => {
    setIsAuthorized(event.target.checked);
  };

  const handleAssuredSwitchChange = (event) => {
    setAssured(event.target.checked);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        showAlert("warning", "Image size must be less than 500KB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value && !selectedCategory.includes(value)) {
      setSelectedCategory((prev) => [...prev, value]);
    }
    e.target.value = "";
  };

  const handleRemoveCategory = (catId) => {
    setSelectedCategory((prev) => prev.filter((id) => id !== catId));
  };

  const handleZoneChange = (e) => {
    const value = e.target.value;
    if (value && !selectedZone.includes(value)) {
      setSelectedZone((prev) => [...prev, value]);
    }
    e.target.value = "";
  };

  const handleRemoveZone = (zoneId) => {
    setSelectedZone((prev) => prev.filter((id) => id !== zoneId));
  };

  const handleStore = async () => {
    if (!storeName || !ownerName || !phone || !email || !latitude || !longitude || !selectedCity) {
      showAlert("warning", "Please fill all required fields");
      return;
    }

    if (isAuthorized && selectedCategory.length === 0) {
      showAlert("warning", "Please select at least one category for authorized store");
      return;
    }

    if (selectedZone.length === 0) {
      showAlert("warning", "Please select at least one zone");
      return;
    }

    try {
      const formData = new FormData();
      showAlert("loading", "Saving store...");
      formData.append("storeName", storeName);
      formData.append("ownerName", ownerName);
      formData.append("PhoneNumber", phone);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("city", selectedCity);
      formData.append("zone", JSON.stringify(selectedZone));
      formData.append("Latitude", latitude);
      formData.append("Longitude", longitude);
      formData.append("Description", des);
      formData.append("isAuthorized", isAuthorized);
      formData.append("isAssured", isAssured);
      formData.append("Category", JSON.stringify(selectedCategory));

      formData.append("gstNumber", gstNumber);
      formData.append("fsiNumber", fsiNumber);
      formData.append("enrollmentId", enrollmentId);
      if (invoicePrefix) formData.append("invoicePrefix", invoicePrefix);

      if (openTime) formData.append("openTime", openTime);
      if (closeTime) formData.append("closeTime", closeTime);

      if (selectedImage instanceof File) {
        formData.append("image", selectedImage);
      }

      let response;
      if (storedetails && storedetails.store) {
        response = await put(`${ENDPOINTS.EDIT_STORE}/${id}`, formData);
      } else {
        response = await post(ENDPOINTS.CREATE_STORE, formData);
      }

      if (response.status === 201) {
        showAlert("success", "Store added successfully!");
        navigate(-1);
      } else if (response.status === 200) {
        showAlert("success", "Store updated successfully!");
        navigate(-1);
      } else if (response.status === 409) {
        // duplicate phone (or similar conflict)
        showAlert("error", "Phone number already in use");
      } else {
        const errorData = await response.json();
        showAlert("Error:", errorData.message || "Failed to save store");
      }
    } catch (error) {
      showAlert("error", "Error saving store: " + (error.message || "Network error"));
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
      {/* Store Details */}
      <div className="store-container">
        <div className="store-header">Store Details</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Store Name</label>
              <input
                type="text"
                placeholder="Enter Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Owner Name</label>
              <input
                type="text"
                placeholder="Enter Owner Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Store Phone Number</label>
              <input
                type="text"
                placeholder="Store Phone Number"
                value={phone}
                maxLength={13}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Password</label>
              <input
                type="text"
                placeholder="Enter Store Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="store-input">
              <label>Enrollment Id</label>
              <input
                type="text"
                placeholder="Enter Enrollment Id"
                value={enrollmentId}
                onChange={(e) => setEnrollmentId(e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>GST Number</label>
              <input
                type="text"
                placeholder="Enter GST Number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>

            <div className="store-input">
              <label>Fssai</label>
              <input
                type="text"
                placeholder="Enter Fssai Number"
                value={fsiNumber}
                onChange={(e) => setFsiNumber(e.target.value)}
              />
            </div>

            <div className="store-input">
              <label>Invoice Prefix</label>
              <input
                type="text"
                placeholder="Enter Invoice Prefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
              />
            </div>
            {storedetails && storedetails.store && (
              <>
                <div className="store-input">
                  <label>Open Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    placeholder="HH:MM"
                  />
                </div>
                <div className="store-input">
                  <label>Close Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    placeholder="HH:MM"
                  />
                </div>
              </>
            )}
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Select City</label>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                <option value="">---Select City---</option>
                {cities.length > 0 ? (
                  cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.city}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading cities...</option>
                )}
              </select>
            </div>
            <div className="store-input">
              <label>Select Zone</label>
              <select
                value=""
                onChange={handleZoneChange}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">---Select Zone---</option>
                {availableZones.length > 0 ? (
                  availableZones.map((zone) => (
                    <option key={zone._id} value={zone._id}>
                      {zone.zoneTitle || zone.address || "Unnamed Zone"}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    {selectedCity ? "No zones available for this city" : "Select a city first"}
                  </option>
                )}
              </select>
              {selectedZone.length > 0 && (
                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedZone.map((zoneId) => {
                    const zone = availableZones.find((z) => z._id === zoneId);
                    if (!zone) return null;
                    return (
                      <span
                        key={zone._id}
                        style={{
                          backgroundColor: "#e0e0e0",
                          padding: "5px 10px",
                          borderRadius: "15px",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRemoveZone(zone._id)}
                      >
                        {zone ? zone.zoneTitle || zone.address || "Unnamed Zone" : zoneId}
                        <span style={{ marginLeft: "5px", color: "#ff0000", fontWeight: "bold" }}>
                          ×
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Latitude</label>
              <input type="text" value={latitude} readOnly />
            </div>
            <div className="store-input">
              <label>Longitude</label>
              <input type="text" value={longitude} readOnly />
            </div>
          </div>

          <div style={{ height: "400px", width: "100%" }}>
            <AdaptiveMap
              center={markerPosition}
              zoom={13}
              onClick={handleMapClick}
              radiusMeters={range * 1000}
            >
              <Marker position={markerPosition} />
              <Circle center={markerPosition} radius={range * 1000} />
            </AdaptiveMap>
          </div>

          <div className="store-row">
            <div className="store-input" style={{ flex: "1 1 100%" }}>
              <label>Description</label>
              <textarea
                placeholder="Type your text here..."
                rows={4}
                value={des}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="store-container">
        <div className="store-header">Category Selection</div>
        <div className="store-form" style={{ marginBottom: "30px" }}>
          <div className="store-row">
            <div className="store-input">
              <label>Authorized Store</label>
              <Switch checked={isAuthorized} onChange={handleSwitchChange} color="success" />
              <p>Status: {isAuthorized ? "Authorized Store" : "Not Authorized"}</p>
            </div>

            <div className="store-input">
              <label>Assured Store</label>
              <Switch checked={isAssured} onChange={handleAssuredSwitchChange} color="success" />
              <p>Status: {isAssured ? "Assured Store" : "Not Assured"}</p>
            </div>

            {isAuthorized && (
              <div className="store-input" style={{ flex: "1 1 100%" }}>
                <label>Select Category</label>
                <select
                  value=""
                  onChange={handleCategoryChange}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="">---Select Category---</option>
                  {mainCategories.length > 0 ? (
                    mainCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading categories...</option>
                  )}
                </select>

                {selectedCategory.length > 0 && (
                  <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {selectedCategory.map((catId) => {
                      const category = mainCategories.find((cat) => cat._id === catId);
                      return (
                        <span
                          key={catId}
                          style={{
                            backgroundColor: "#e0e0e0",
                            padding: "5px 10px",
                            borderRadius: "15px",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleRemoveCategory(catId)}
                        >
                          {category ? category.name : catId}
                          <span style={{ marginLeft: "5px", color: "#ff0000", fontWeight: "bold" }}>
                            ×
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="store-container">
        <div className="store-header">Gallery</div>
        <div className="store-form">
          <div className="store-input" style={{ flex: "1 1 100%" }}>
            <label>Choose Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {selectedImage && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <img
                  src={`${process.env.REACT_APP_IMAGE_LINK}${selectedImage}`}
                  alt="Preview"
                  style={{
                    width: "80%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <Button
          variant="contained"
          style={{
            backgroundColor: "#00c853",
            color: "white",
            fontSize: "15px",
          }}
          onClick={handleStore}
        >
          SAVE
        </Button>

        <Button
          variant="contained"
          style={{
            backgroundColor: "#00c853",
            color: "white",
            fontSize: "15px",
          }}
          onClick={() => navigate(-1)}
        >
          CANCEL
        </Button>
      </div>
    </MDBox>
  );
}

export default AddStore;
