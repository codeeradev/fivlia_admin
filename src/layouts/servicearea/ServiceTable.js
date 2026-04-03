import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Switch } from "@mui/material";
import { getAllZones } from "components/commonApi/commonApi";
import { put, del } from "api/apiClient";
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

const formatRange = (value) => {
  if (typeof value !== "number" || value <= 0) return "Not set";
  return value >= 1000 ? (value / 1000).toFixed(1) + " km" : value + " m";
};

function Table() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getAllZones();
        const data = await res.data;

        const allZones = (data || []).flatMap(cityObj => {
          if (!Array.isArray(cityObj.zones) || cityObj.zones.length === 0) return [];

          const cityName = Array.isArray(cityObj.city) ? cityObj.city[0] : cityObj.city;

          return cityObj.zones.map(zone => ({
            ...zone,
            city: cityName
          }));
        });


        setLocations(allZones);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchLocations();
  }, []);


  const distinctCities = ["All Cities", ...new Set(locations.map((loc) => loc.city))];

  const filteredLocations = locations.filter((item) => {
    const search = searchTerm.toLowerCase();
    const formattedDayRange = formatRange(item.range);
    const formattedNightRange = formatRange(item.nightRange);
    const zoneStoreCount = String(item.storeCount ?? 0);

    // Check city filter: if 'All Cities' selected, ignore city filtering
    const cityMatch = selectedCity === "All Cities" || item.city === selectedCity;

    // Check if search term matches any field
    const searchMatch =
      item.city.toLowerCase().includes(search) ||
      item.address.toLowerCase().includes(search) ||
      formattedDayRange.toLowerCase().includes(search) ||
      formattedNightRange.toLowerCase().includes(search) ||
      zoneStoreCount.includes(search);

    return cityMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredLocations.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentLocations = filteredLocations.slice(startIndex, startIndex + entriesToShow);

  const handleEntriesChange = (e) => {
    setEntriesToShow(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);


 
  const updateZone = async (id, updatedFields) => {
    try {
      await put(`${ENDPOINTS.UPDATE_ZONE_STATUS}/${id}`, updatedFields);

        setLocations((prev) =>
          prev.map((zone) =>
            zone._id === id ? { ...zone, ...updatedFields } : zone
          )
        );

    } catch (error) {
      console.error("Error updating zone:", error);
    }
  };

  // Toggle zone status
  const handleToggleStatus = (id, newStatus, currentCOD,city) => {
    updateZone(id, { status: newStatus, cashOnDelivery: currentCOD,   city });
  };

  // Toggle cash on delivery
  const handleToggleCashOnDelivery = (id, currentStatus, newCOD,city) => {
    updateZone(id, { status: currentStatus, cashOnDelivery: newCOD,   city });
  };

  const handleDeleteZone = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this zone?");
    if (!confirmDelete) return;

    try {
      await del(`${ENDPOINTS.DELETE_ZONE}/${id}`);
      setLocations((prev) => prev.filter((zone) => zone._id !== id));
      if (currentPage > 1 && currentLocations.length === 1) {
        setCurrentPage((prev) => prev - 1);
      }
      showAlert("success", "Zone deleted successfully");
    } catch (error) {
      console.error("Error deleting zone:", error);
      const apiMessage = error.response?.data?.message;
      const assignedStoreCount = error.response?.data?.storeCount;
      const fallbackMessage = "Failed to delete zone";
      const storeCountMessage =
        typeof assignedStoreCount === "number"
          ? ` Assigned stores: ${assignedStoreCount}.`
          : "";

      showAlert("error", `${apiMessage || fallbackMessage}`);
    }
  };



  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
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
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Zones Lists</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all zones</span>
            </div>
            <div>
              <Button
                style={{
                  backgroundColor: "#00c853",
                  height: 45,
                  width: 150,
                  fontSize: 12,
                  color: "white",
                  letterSpacing: "1px",
                }}
                onClick={() => navigate("/addlocation")}
              >
                + Create Zone
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >


            {/* Entries dropdown */}
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>Show Entries</span>&nbsp;
              <select value={entriesToShow} onChange={handleEntriesChange}>
                <option value={5}>100</option>
                <option value={10}>150</option>
                <option value={20}>200</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* Left side dropdown for city */}
              <div style={{ marginBottom: 10, marginRight: '40px', marginTop: '' }}>
                <label style={{ fontSize: 16, }}>Filter by City:</label>
                <select value={selectedCity} onChange={handleCityChange} style={{ fontSize: 16, borderRadius: "6px" }}>
                  {distinctCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search input */}
              <div style={{ marginBottom: 8, marginTop: "15px", display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 16, marginTop: '-8px', marginLeft: '5px', marginBottom: '5px' }}>Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  style={{
                    padding: "5px",
                    borderRadius: "20px",
                    height: "45px",
                    marginTop: '-5px',
                    width: "200px",
                    border: "1px solid #ccc",
                    fontSize: 17,
                    paddingLeft: "15px",
                  }}
                />
              </div>

            </div>
          </div>

          {/* Table and pagination remain unchanged */}
          <div style={{ overflowX: "auto" }}>
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
                  <th style={{ ...headerCell, width: "12%" }}>Zone Title</th>
                  <th style={headerCell}>Zone Address</th>
                  <th style={headerCell}>Cash Delivery</th>
                  <th style={headerCell}>Status</th>
                  <th style={headerCell}>Day Range</th>
                  <th style={headerCell}>Night Range</th>
                  <th style={headerCell}>City</th>
                  <th style={headerCell}>Store Count</th>
                  <th style={{ ...headerCell, width: "12%", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentLocations.map((item, index) => (
                  <tr key={item._id}>
                    <td style={{ ...bodyCell, textAlign: 'center' }}>{startIndex + index + 1}</td>
                    <td style={{ ...bodyCell, textAlign: 'center' }}>{item.zoneTitle}</td>
                    <td style={bodyCell}>{item.address.split(",").slice(0, 2).join(",")}</td>
                    <td style={{ ...bodyCell, width: '150px', textAlign: 'center' }}>
                      <Switch
                        checked={item.cashOnDelivery}
                        color="success"
                        inputProps={{ "aria-label": "controlled" }}
                        onChange={() => handleToggleCashOnDelivery(item._id, item.status, !item.cashOnDelivery, item.city)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "green",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "green !important",
                          },
                          "& .MuiSwitch-track": {
                            backgroundColor: "red",
                            opacity: 1,
                          },
                        }}
                      />
                    </td>
                    <td style={{ ...bodyCell, textAlign: 'center' }}>
                      <Switch
                        checked={item.status}
                        onChange={() => handleToggleStatus(item._id, !item.status, item.cashOnDelivery, item.city)}
                        inputProps={{ "aria-label": "controlled" }}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "green",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "green !important",
                          },
                          "& .MuiSwitch-track": {
                            backgroundColor: "red",
                            opacity: 1,
                          },
                        }}
                      />

                    </td>

                    <td style={bodyCell}>{formatRange(item.range)}</td>
                    <td style={bodyCell}>{formatRange(item.nightRange)}</td>
                    <td style={bodyCell}>{item.city}</td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>{item.storeCount ?? 0}</td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <button
                          style={{
                            backgroundColor: "#007BFF",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            marginRight: "10px",
                          }}
                          onClick={() => navigate("/edit-zone", { state: { zone: item } })}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleDeleteZone(item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span>
              Showing {startIndex + 1}-
              {Math.min(startIndex + entriesToShow, filteredLocations.length)} of{" "}
              {filteredLocations.length} locations
            </span>
            <div>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 16px",
                  marginRight: 10,
                  borderRadius: 10,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default Table;
