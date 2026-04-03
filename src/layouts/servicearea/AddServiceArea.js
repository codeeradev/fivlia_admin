import React, { useState, useEffect, useRef } from "react";
import { TextField, Slider, Button } from "@mui/material";
import { Marker, Circle } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import AdaptiveMap from "../../components/Maps/AdaptiveMap";
import { useMapsApi } from "../../hooks/useMapsApi";
import { Autocomplete as GooglePlacesAutocomplete } from "@react-google-maps/api";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { post } from "api/apiClient";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places"];

const pickFirstDefined = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

const hasWindow = (start, end) => Boolean(start && end);

function AddServiceArea() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const { apiType, googleFatalError } = useMapsApi();
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    if (apiType === "google" && !googleFatalError) {
      const check = () => {
        const ready = !!(window.google && window.google.maps && window.google.maps.places);
        setIsGoogleReady(ready);
      };
      check();
      const interval = setInterval(check, 300);
      return () => clearInterval(interval);
    }
    setIsGoogleReady(false);
  }, [apiType, googleFatalError]);

  const [dayRange, setDayRange] = useState(3.2);
  const [nightRange, setNightRange] = useState(3.2);
  const [areaTitle, setAreaTitle] = useState("");
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 29.1492, lng: 75.7217 });
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [title, setTitle] = useState("");
  const [windowConfig, setWindowConfig] = useState({
    dayStartTime: "",
    dayEndTime: "",
    nightStartTime: "",
    nightEndTime: "",
    // zoneTimeZone: "",
    dayEnabled: true,
    nightEnabled: true,
  });

  const autocompleteRef = useRef(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await get(ENDPOINTS.GET_AVIABLE_CITY);
        const data = await res.data;
        if (data && data.length > 0) {
          setCities(data);
          const firstCity = data[0];
          setCity(firstCity);
          const coords = { lat: firstCity.latitude, lng: firstCity.longitude };
          setMarkerPosition(coords);
          setLatitude(coords.lat);
          setLongitude(coords.lng);
        }
      } catch (err) {
        console.error("Failed to fetch cities", err);
        showAlert("error", "Failed to load cities from API.");
      }
    }
    fetchCities();
  }, []);

  useEffect(() => {
    async function fetchZoneWindowConfig() {
      try {
        const response = await get(ENDPOINTS.GET_SETTINGS);
        const settings = response?.data?.settings || {};

        const dayStartTime = pickFirstDefined(settings, ["dayStartTime", "dayStart", "dayTimeStart"]);
        const dayEndTime = pickFirstDefined(settings, ["dayEndTime", "dayEnd", "dayTimeEnd"]);
        const nightStartTime = pickFirstDefined(settings, [
          "nightStartTime",
          "nightStart",
          "nightTimeStart",
        ]);
        const nightEndTime = pickFirstDefined(settings, ["nightEndTime", "nightEnd", "nightTimeEnd"]);
        // const zoneTimeZone = pickFirstDefined(settings, [
        //   "zoneTimeZone",
        //   "zoneTimezone",
        //   "timeZone",
        //   "timezone",
        // ]);

        const dayEnabled = hasWindow(dayStartTime, dayEndTime);
        const nightEnabled = hasWindow(nightStartTime, nightEndTime);
        const noWindowsConfigured = !dayEnabled && !nightEnabled;

        setWindowConfig({
          dayStartTime,
          dayEndTime,
          nightStartTime,
          nightEndTime,
          // zoneTimeZone,
          dayEnabled: noWindowsConfigured ? true : dayEnabled,
          nightEnabled: noWindowsConfigured ? true : nightEnabled,
        });
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    }

    fetchZoneWindowConfig();
  }, []);

  const handleDayRangeChange = (_, newValue) => setDayRange(newValue);
  const handleNightRangeChange = (_, newValue) => setNightRange(newValue);

  const handleCityChange = (event) => {
    const selectedCity = cities.find((c) => c._id === event.target.value);
    if (selectedCity) {
      const coords = { lat: selectedCity.latitude, lng: selectedCity.longitude };
      setCity(selectedCity);
      setMarkerPosition(coords);
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setAreaTitle("");
    }
  };

  const handleSave = async () => {
    try {
      showAlert("loading", "Loading cities...");
      if (!city) {
        showAlert("warning", "Please select a city");
        return;
      }
      if (!areaTitle) {
        showAlert("warning", "Please enter/select a zone");
        return;
      }
      if (!title) {
        showAlert("warning", "Invalid Title");
        return;
      }
      if (windowConfig.dayEnabled && (!dayRange || dayRange <= 0)) {
        showAlert("warning", "Please set day radius");
        return;
      }
      if (windowConfig.nightEnabled && (!nightRange || nightRange <= 0)) {
        showAlert("warning", "Please set night radius");
        return;
      }

      const dayRangeMeters = windowConfig.dayEnabled ? dayRange * 1000 : null;
      const nightRangeMeters = windowConfig.nightEnabled ? nightRange * 1000 : null;

      const payload = {
        city: city.city,
        zoneTitle: title,
        address: areaTitle,
        latitude,
        longitude,
        range: dayRangeMeters || nightRangeMeters,
        nightRange: nightRangeMeters,
      };

      await post(ENDPOINTS.ADD_ZONE, payload);

      showAlert("success", "Area Saved Successfully");
      navigate(-1);
    } catch (err) {
      console.error("Save failed:", err);
      showAlert("error", "Error saving area.");
    }
  };

  const handleMapClick = (e) => {
    // Google click
    if (e?.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            setAreaTitle(results[0].formatted_address);
          } else {
            setAreaTitle("");
          }
        });
      } else {
        setAreaTitle(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
      return;
    }

    // Leaflet/Ola click
    if (typeof e?.lat === "number" && typeof e?.lng === "number") {
      const lat = e.lat;
      const lng = e.lng;
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });
      setAreaTitle(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };
  const dayRadiusMeters = windowConfig.dayEnabled && dayRange > 0 ? dayRange * 1000 : null;
  const nightRadiusMeters =
    windowConfig.nightEnabled && nightRange > 0 ? nightRange * 1000 : null;

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2}>
      <div style={{ padding: "20px", maxWidth: "80%", margin: "0 auto", fontFamily: "Arial" }}>
        <h2 style={{ textAlign: "center", color: "green", marginBottom: "40px" }}>ADD NEW ZONE</h2>

        {/* City Dropdown */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>City</label>
          <select style={{ width: "70%" }} onChange={handleCityChange} value={city?._id || ""}>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.city}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone Title</label>
          <input
            type="text"
            style={{ width: "70%" }}
            placeholder="Enter Zone Title"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Google Places Autocomplete */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone</label>
          <div style={{ width: "70%" }}>
            {apiType === "google" && isGoogleReady ? (
              <GooglePlacesAutocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={() => {
                  const place = autocompleteRef.current.getPlace();
                  if (place.geometry) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    setAreaTitle(place.formatted_address);
                    setLatitude(lat);
                    setLongitude(lng);
                    setMarkerPosition({ lat, lng });
                  }
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search for a location"
                  value={areaTitle}
                  onChange={(e) => setAreaTitle(e.target.value)}
                />
              </GooglePlacesAutocomplete>
            ) : (
              <TextField
                fullWidth
                placeholder="Search for a location"
                value={areaTitle}
                onChange={(e) => setAreaTitle(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Map and Steps Section */}
        <div style={{ display: "flex", flexDirection: "row", gap: "30px", marginBottom: "30px" }}>
          {/* Steps */}
          <div
            style={{ flex: "1", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}
          >
            <h3 style={{ color: "#333", marginBottom: "15px" }}>Steps to Add a New Service Area</h3>
            <ul style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.5", color: "#555" }}>
              <li style={{ marginBottom: "10px" }}>
                <strong>Step 1:</strong> Select a city for the service area.
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Step 2:</strong> Search and select a zone from suggestions.
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Step 3:</strong> Adjust day and night radius using sliders.
              </li>
              <li>
                <strong>Step 4:</strong> Click Save to add the zone.
              </li>
            </ul>
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
              style={mapContainerStyle}
              center={markerPosition}
              zoom={13}
              onClick={handleMapClick}
              radiusMeters={dayRadiusMeters}
              secondaryRadiusMeters={nightRadiusMeters}
              primaryRadiusColor="#2e7d32"
              secondaryRadiusColor="#1565c0"
            >
              <Marker position={markerPosition} />
              {dayRadiusMeters ? (
                <Circle
                  center={markerPosition}
                  radius={dayRadiusMeters}
                  options={{
                    strokeColor: "#2e7d32",
                    strokeOpacity: 0.85,
                    strokeWeight: 2,
                    fillColor: "#2e7d32",
                    fillOpacity: 0.12,
                  }}
                />
              ) : null}
              {nightRadiusMeters ? (
                <Circle
                  center={markerPosition}
                  radius={nightRadiusMeters}
                  options={{
                    strokeColor: "#1565c0",
                    strokeOpacity: 0.85,
                    strokeWeight: 2,
                    fillColor: "#1565c0",
                    fillOpacity: 0.08,
                  }}
                />
              ) : null}
            </AdaptiveMap>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", marginTop: "-15px", marginBottom: "20px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#2e7d32",
              }}
            />
            Day Radius
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#1565c0",
              }}
            />
            Night Radius
          </span>
        </div>

        <label>Day Radius</label>
        <Slider
          value={dayRange}
          onChange={handleDayRangeChange}
          min={0.1}
          max={50}
          step={0.1}
          disabled={!windowConfig.dayEnabled}
          valueLabelDisplay="auto"
          style={{ color: "#007bff", marginBottom: "10px" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <span>0.1 km</span>
          <span>{dayRange.toFixed(1)} km</span>
          <span>50 km</span>
        </div>

        <label>Night Radius</label>
        <Slider
          value={nightRange}
          onChange={handleNightRangeChange}
          min={0.1}
          max={50}
          step={0.1}
          disabled={!windowConfig.nightEnabled}
          valueLabelDisplay="auto"
          style={{ color: "#007bff", marginBottom: "10px" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>0.1 km</span>
          <span>{nightRange.toFixed(1)} km</span>
          <span>50 km</span>
        </div>

        <div style={{ marginTop: "10px", fontSize: "13px", color: "#555" }}>
          <div>
            Day Window:{" "}
            {windowConfig.dayEnabled
              ? `${windowConfig.dayStartTime} - ${windowConfig.dayEndTime}`
              : "Not configured"}
          </div>
          <div>
            Night Window:{" "}
            {windowConfig.nightEnabled
              ? `${windowConfig.nightStartTime} - ${windowConfig.nightEndTime}`
              : "Not configured"}
          </div>
          {/* {windowConfig.zoneTimeZone ? <div>Timezone: {windowConfig.zoneTimeZone}</div> : null} */}
        </div>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "20px", backgroundColor: "#00c853" }}
          onClick={handleSave}
        >
          <h4 style={{ color: "white", fontSize: "15px" }}>Save Service Area</h4>
        </Button>
      </div>
    </MDBox>
  );
}

export default AddServiceArea;
