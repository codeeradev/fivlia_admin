import React, { useState, useEffect } from "react";
import {
  TextField,
  Slider,
  Button,
} from "@mui/material";
import { Marker, Circle } from "@react-google-maps/api";
import { useNavigate, useLocation } from "react-router-dom";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import AdaptiveMap from "../../components/Maps/AdaptiveMap";
import { useMapsApi } from "../../hooks/useMapsApi";
import { Autocomplete as GMapsAutocomplete } from "@react-google-maps/api";
import { showAlert } from "components/commonFunction/alertsLoader"
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";


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

function EditZone() {
  const location = useLocation();
  const { zone: initialZone } = location.state || {};
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const { apiType, googleFatalError } = useMapsApi();
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    if (apiType === 'google' && !googleFatalError) {
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
  const [zones, setZones] = useState([]);
  const [zoneTitle,setZoneTitle]=useState('')
  const [zone, setZone] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 29.1492, lng: 75.7217 });
  const [id, setId] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [windowConfig, setWindowConfig] = useState({
    dayStartTime: "",
    dayEndTime: "",
    nightStartTime: "",
    nightEndTime: "",
    // zoneTimeZone: "",
    dayEnabled: true,
    nightEnabled: true,
  });

  // Loader is managed centrally by AdaptiveMap; avoid re-initializing with different options

  useEffect(() => {
    if (initialZone) {
      setId(initialZone._id);
      setAreaTitle(initialZone.address);
      setZoneTitle(initialZone.zoneTitle)
      if (initialZone.latitude && initialZone.longitude) {
        const coords = {
          lat: initialZone.latitude,
          lng: initialZone.longitude,
        };
        setMarkerPosition(coords);
        setLatitude(coords.lat);
        setLongitude(coords.lng);
      }
      if (initialZone.range) setDayRange(initialZone.range / 1000);
      if (initialZone.nightRange) setNightRange(initialZone.nightRange / 1000);
    }
  }, [initialZone]);

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

  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await get(ENDPOINTS.GET_AVIABLE_CITY);
        const data = await res.data;
        if (data && data.length > 0) {
          setZones(data);

          if (initialZone && initialZone.city) {
            const matchedZone = data.find(
              (z) => z.city.toLowerCase() === initialZone.city.toLowerCase()
            );
            if (matchedZone) {
              setZone(matchedZone);
              const coords = { lat: matchedZone.latitude, lng: matchedZone.longitude };
              setMarkerPosition(coords);
              setLatitude(coords.lat);
              setLongitude(coords.lng);
              return;
            }
          }

          const firstZone = data[0];
          setZone(firstZone);
          const coords = { lat: firstZone.latitude, lng: firstZone.longitude };
          setMarkerPosition(coords);
          setLatitude(coords.lat);
          setLongitude(coords.lng);
        }
      } catch (err) {
        console.error("Failed to fetch zones", err);
        showAlert("error", "Failed to load cities from API.");
      }
    }
    fetchZones();
  }, [initialZone]);

  const handleDayRangeChange = (_, newValue) => setDayRange(newValue);
  const handleNightRangeChange = (_, newValue) => setNightRange(newValue);

  const handleZoneChange = (event) => {
    const selectedZone = zones.find((z) => z._id === event.target.value);
    if (selectedZone) {
      const coords = { lat: selectedZone.latitude, lng: selectedZone.longitude };
      setZone(selectedZone);
      setMarkerPosition(coords);
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setAreaTitle("");
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || "";
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      return "";
    }
  };

  const handleMapClick = async (e) => {
    // Google Maps click
    if (e?.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });
      if (window.google && window.google.maps) {
        await reverseGeocode(lat, lng);
      } else {
        setAreaTitle(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
      return;
    }

    // Leaflet/Ola fallback click
    if (typeof e?.lat === 'number' && typeof e?.lng === 'number') {
      const lat = e.lat;
      const lng = e.lng;
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });
      const addr = await reverseGeocode(lat, lng);
      setAreaTitle(addr || `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const updateZone = async () => {
    if (!zoneTitle?.trim()) {
      showAlert("warning", "Invalid Title");
      return;
    }
    if (!areaTitle?.trim()) {
      showAlert("warning", "Please enter/select zone address");
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

    const dataToSave = {
      city: zone?.city,
      state: zone?.state,
      address: areaTitle,
      zoneTitle:zoneTitle,
      latitude,
      longitude,
      range: dayRangeMeters || nightRangeMeters,
      nightRange: nightRangeMeters,
    };

    try {
        await put(`${ENDPOINTS.UPDATE_ZONE_STATUS}/${id}`, dataToSave);
        showAlert("success", "Zone updated successfully!");
        navigate(-1);
    } catch (error) {
      console.error("Error updating zone:", error);
      showAlert("error", "Error updating zone.");
    }
  };

  // Rendering of map is handled by AdaptiveMap. For Autocomplete input, gate usage to google-only
  const dayRadiusMeters = windowConfig.dayEnabled && dayRange > 0 ? dayRange * 1000 : null;
  const nightRadiusMeters =
    windowConfig.nightEnabled && nightRange > 0 ? nightRange * 1000 : null;

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2}>
      <div style={{ padding: "20px", maxWidth: "65%", margin: "0 auto", fontFamily: "Arial" }}>
        <h2 style={{ textAlign: "center", color: "green", marginBottom: "40px" }}>EDIT ZONE</h2>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>City</label>
          <select
            style={{ width: "70%" }}
            onChange={handleZoneChange}
            value={zone?._id || ""}
          >
            {zones.map((z) => (
              <option key={z._id} value={z._id}>
                {z.city}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone Title</label>
          <input type="text" value={zoneTitle} placeholder="Enter Zone Title"
           style={{width:'70%'}}
           onChange={(e) => setZoneTitle(e.target.value)}
           />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone Address</label>
          <div style={{ width: "70%" }}>
            {apiType === 'google' && isGoogleReady ? (
              <GMapsAutocomplete
              onLoad={(autocomplete) => {
                window.autocompleteInstance = autocomplete;
              }}
              onPlaceChanged={() => {
                if (window.autocompleteInstance) {
                  const place = window.autocompleteInstance.getPlace();
                  if (place.geometry) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const coords = { lat, lng };
                    setMarkerPosition(coords);
                    setLatitude(lat);
                    setLongitude(lng);
                    setAreaTitle(place.formatted_address || place.name);
                  }
                }
              }}
              >
                <TextField
                  fullWidth
                  placeholder="Search Zone Address"
                  value={areaTitle}
                  onChange={(e) => setAreaTitle(e.target.value)}
                />
              </GMapsAutocomplete>
            ) : (
              <TextField
                fullWidth
                placeholder="Search Zone Address"
                value={areaTitle}
                onChange={(e) => setAreaTitle(e.target.value)}
              />
            )}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "250px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
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
          onClick={updateZone}
        >
          <h4 style={{ color: "white", fontSize: "15px" }}>Edit Service Area</h4>
        </Button>
      </div>
    </MDBox>
  );
}

export default EditZone;
