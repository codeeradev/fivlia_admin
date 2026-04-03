import React, { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";
import { Marker } from "@react-google-maps/api";
import { useNavigate, useLocation } from "react-router-dom";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import AdaptiveMap from "../../components/Maps/AdaptiveMap";
import { useMapsApi } from "../../hooks/useMapsApi";
import { showAlert } from "components/commonFunction/alertsLoader";
import { updateCityStatus } from "components/commonApi/commonApi";
import "./City.css";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

function EditCity() {
  const location = useLocation();
  const { city: initialCity } = location.state || {};
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
  const [id, setId] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  useEffect(() => {
    if (location.state) {
      const cityData = location.state;
      setId(cityData.id);

      setSelectedCity(cityData.name || cityData.city || "");
      setSelectedState(cityData.state || "");
      setFullAddress(cityData.fullAddress || cityData.name || "");
      setSearchTerm(cityData.fullAddress || cityData.name || "");
      if (cityData.latitude && cityData.longitude) {
        setLatitude(cityData.latitude);
        setLongitude(cityData.longitude);
        setMarkerPosition({ lat: cityData.latitude, lng: cityData.longitude });
      } else if (cityData.lat && cityData.lng) {
        setLatitude(cityData.lat);
        setLongitude(cityData.lng);
        setMarkerPosition({ lat: cityData.lat, lng: cityData.lng });
      }
    }
  }, [location.state]);

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
      showAlert("error", "Please select a city/location first!");
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
      showAlert("loading", "Updating city...");

      const response = await updateCityStatus(id, dataToSave);

      if (response.status === 200) {
        showAlert("success", "City updated successfully!");
        navigate(-1);
      } else {
        showAlert("error", "Failed to update city!");
      }
    } catch (err) {
      console.error("Error saving city:", err);
      showAlert("error", "An error occurred while updating the city");
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="city-container">
        <h2 style={{ textAlign: "center", color: "green", fontWeight: 500, marginTop: "-30px" }}>
          EDIT CITY
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

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "30px",
              justifyContent: "center",
              alignItems: "center",
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

export default EditCity;
