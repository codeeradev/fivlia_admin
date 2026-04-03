import React, { useState, useEffect } from "react";
import { Button, TextField, Switch, FormControlLabel } from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { post, get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function AddDriver() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [driverName, setDriverName] = useState("");
  const [status, setStatus] = useState(true);
  const [image, setImage] = useState(null);
  const [mobileNo, setMobileNo] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState("");

  const [policeVerification, setPoliceVerification] = useState(null);
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [dlFront, setDlFront] = useState(null);
  const [dlBack, setDlBack] = useState(null);
  const dispatch = useDispatch();

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        showAlert("loading", "Loading cities...");

        const res = await get(ENDPOINTS.GET_CITY);
        const data = res.data;
        if (Array.isArray(data)) {
          setCities(data);
        }
        showAlert("success", "Cities loaded");
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        showAlert("error", "Failed to load cities");
      }
    };

    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !policeVerification || !aadharFront || !aadharBack || !dlFront || !dlBack) {
      showAlert("error", "Please upload all required files");
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (
      image.size > MAX_SIZE ||
      policeVerification.size > MAX_SIZE ||
      aadharFront.size > MAX_SIZE ||
      aadharBack.size > MAX_SIZE ||
      dlFront.size > MAX_SIZE ||
      dlBack.size > MAX_SIZE
    ) {
      showAlert("error", "Each file must be less than 2MB");
      return;
    }

    const formData = new FormData();

    formData.append("driverName", driverName);
    formData.append("vehicleRegistrationNumber", vehicleRegistrationNumber);
    formData.append("drivingLicenseNumber", drivingLicenseNumber);
    formData.append("status", status ? "true" : "false");
    formData.append("image", image);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("Police_Verification_Copy", policeVerification);
    formData.append("aadharCard", aadharFront); // index 0
    formData.append("aadharCard", aadharBack); // index 1

    formData.append("drivingLicence", dlFront); // index 0
    formData.append("drivingLicence", dlBack);
    formData.append(
      "address",
      JSON.stringify({
        mobileNo,
        locality,
        city,
      })
    );

    try {
      await post(ENDPOINTS.ADD_DRIVER, formData);

      showAlert("success", "Driver added successfully");
      navigate("/drivers");
    } catch (err) {
      console.error("Upload error:", err);
      if (err?.response?.status === 409) {
        showAlert("error", err.response.data.message);
      } else {
        showAlert("error", "Failed to add driver");
      }
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={3}>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 600,
          margin: "auto",
          background: "#fff",
          padding: 30,
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#00c853" }}>Add Driver</h2>

        <TextField
          label="Driver Name"
          fullWidth
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Email"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Password"
          fullWidth
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        <FormControlLabel
          control={
            <Switch
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              color="primary"
            />
          }
          label="Status"
        />

        <TextField
          label="Mobile Number"
          fullWidth
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Driving License Number"
          fullWidth
          value={drivingLicenseNumber}
          onChange={(e) => setDrivingLicenseNumber(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Vehicle Registration Number"
          fullWidth
          value={vehicleRegistrationNumber}
          onChange={(e) => setVehicleRegistrationNumber(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Locality"
          fullWidth
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          select
          label=""
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value)}
          margin="normal"
          required
          SelectProps={{ native: true }}
        >
          <option value="">-- Select City --</option>
          {cities.map((c, index) => (
            <option key={index} value={c.city}>
              {c.city}
            </option>
          ))}
        </TextField>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setImage)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Police Verification Copy:</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => handleFileChange(e, setPoliceVerification)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Aadhar Card (Front):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setAadharFront)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Aadhar Card (Back):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setAadharBack)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Driving License (Front):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setDlFront)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Driving License (Back):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setDlBack)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <Button type="submit" variant="contained" color="success" style={{ minWidth: 100 }}>
            Submit
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "gray", color: "white", minWidth: 100 }}
            onClick={() => navigate("/drivers")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </MDBox>
  );
}

export default AddDriver;
