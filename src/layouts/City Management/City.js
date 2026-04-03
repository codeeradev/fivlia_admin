import React, { useState, useEffect, useRef } from "react";
import { TextField, Button } from "@mui/material";
import { Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import AdaptiveMap from "../../components/Maps/AdaptiveMap";
import { useMapsApi } from "../../hooks/useMapsApi";
import "./City.css";
import { post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 29.2396596,
  lng: 75.8174505,
};

function City() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const { apiType } = useMapsApi();
  const searchRef = useRef(null);

  const [cityCoordinates, setCityCoordinates] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        value
      )}&addressdetails=1`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSelectSuggestion = (item) => {
    const { lat, lon, address, display_name } = item;
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.state_district ||
      "Unknown City";
    const state = address.state || "Unknown State";

    setSelectedCity(city);
    setSelectedState(state);
    setFullAddress(display_name);
    setSearchTerm(display_name);
    setLatitude(parseFloat(lat));
    setLongitude(parseFloat(lon));
    setMarkerPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
    setSuggestions([]);
  };

  // map click handler
  const handleMapClick = async (e) => {
    if (apiType === "google" && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });

      // Use Google Geocoder if available
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const address = results[0].address_components;
            const city =
              address.find(
                (comp) =>
                  comp.types.includes("locality") ||
                  comp.types.includes("administrative_area_level_2")
              )?.long_name || "Unknown City";
            const state =
              address.find((comp) => comp.types.includes("administrative_area_level_1"))
                ?.long_name || "Unknown State";

            setSelectedCity(city);
            setSelectedState(state);
            setFullAddress(results[0].formatted_address);
            setSearchTerm(results[0].formatted_address);
          }
        });
      }
    } else if (apiType === "ola") {
      // For Ola Maps, use OpenStreetMap reverse geocoding
      const lat = e.lat || e.latLng?.lat();
      const lng = e.lng || e.latLng?.lng();

      if (lat && lng) {
        setLatitude(lat);
        setLongitude(lng);
        setMarkerPosition({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          const data = await res.json();
          const address = data.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.locality ||
            address.municipality ||
            address.state_district ||
            "Unknown City";
          const state = address.state || "Unknown State";

          setSelectedCity(city);
          setSelectedState(state);
          setFullAddress(data.display_name || "");
          setSearchTerm(data.display_name || "");
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setSelectedCity("Unknown City");
          setSelectedState("Unknown State");
          setFullAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setSearchTerm(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!latitude || !longitude) {
      alert("Please select a city/location first!");
      return;
    }

    const dataToSave = {
      city: selectedCity,
      state: selectedState,
      fullAddress,
      latitude: latitude,
      longitude: longitude,
    };

    try {
      showAlert("loading", "Creating Cities...");
      const result = await post(ENDPOINTS.ADD_CITY_DATA, dataToSave);

      if (result.status === 200) {
        showAlert("success", "Cities Added Successfully");
        navigate(-1);
      }
    } catch (err) {
      showAlert("error", "Failed to create city");
      console.error("Error saving city:", err);
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="city-container">
        <h2 style={{ textAlign: "center", color: "green", fontWeight: 500, marginTop: "-30px" }}>
          ADD CITY
        </h2>
        <div className="add-city-box">
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
            <div>
              <h3 style={{ textAlign: "center", marginLeft: "70px" }}>City</h3>
            </div>
            <div
              style={{ width: "33%", position: "relative", marginRight: "30px" }}
              ref={searchRef}
            >
              <input
                type="text"
                placeholder="Search City"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {suggestions.length > 0 && (
                <ul className="suggestion-list">
                  {suggestions.map((item, index) => (
                    <li key={index} onClick={() => handleSelectSuggestion(item)}>
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Map */}
          <div
            style={{
              flex: "2",
              height: "375px",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          >
            <AdaptiveMap
              style={containerStyle}
              center={markerPosition}
              zoom={13}
              onClick={handleMapClick}
            >
              <Marker position={markerPosition} />
            </AdaptiveMap>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "30px",
              gap: "30px",
            }}
          >
            <Button
              style={{
                backgroundColor: "#00c853",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              style={{
                backgroundColor: "gray",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default City;
