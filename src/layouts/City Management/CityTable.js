import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Switch } from "@mui/material";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

export default function CityTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    const getCity = async () => {
      try {
        showAlert("loading", "Fetching cities...");
        const result = await get(ENDPOINTS.GET_CITY);
        const data = result.data;

        if (Array.isArray(data)) {
          const citiesWithDetails = data.map((city) => ({
            id: city._id,
            name: city.city,
            state: city.state,
            status: Boolean(city.status),
            latitude: city.latitude,
            longitude: city.longitude,
            fullAddress: city.fullAddress,
            createdAt: city.createdAt,
            updatedAt: city.updatedAt,
          }));
          setCities(citiesWithDetails);
          showAlert("success", "Cities loaded");

        } else {
          console.error("Expected array but got:", data);
          showAlert("error", "Invalid response from server");
        }
      } catch (err) {
        console.log("Error fetching cities:", err);
        showAlert("error", "Failed to load cities");
      }
    };

    getCity();
  }, []);

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCities.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentCities = filteredCities.slice(startIndex, endIndex);

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

  // Updated toggleStatus: update backend first, then update UI on success
  const toggleStatus = async (id) => {
    const cityToUpdate = cities.find((city) => city.id === id);
    if (!cityToUpdate) return;

    const newStatus = !cityToUpdate.status;

    try {
       showAlert("loading", "Updating status...");
       await put(`${ENDPOINTS.UPDATE_CITY_STATUS}/${id}`,{ status: newStatus });

      // Update state only after successful backend update
      setCities((prevCities) =>
        prevCities.map((city) =>
          city.id === id ? { ...city, status: newStatus } : city
        )
      );
      showAlert("success", "Status updated successfully");
    } catch (error) {
      showAlert("error", "Failed to update status");
      console.error(error);
    }
  };

  const handleEdit = (city) => {
    alert(`Edit city: ${city.name}`);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>City Lists</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>View and manage all cities</p>
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
            onClick={() => navigate("/city")}
          >
            + Add City
          </Button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
          <div>
            <label style={{ fontSize: 17 }}>Show Entries&nbsp;</label>
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
              {[100, 150, 200, 300].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 17, marginRight: 8 }}>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search cities..."
              style={{
                padding: "8px 14px",
                borderRadius: "25px",
                height: "42px",
                width: "220px",
                border: "1px solid #ccc",
                fontSize: 16,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "17px",
              border: "1px solid #007BFF",

            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
                <th style={{ ...headerCell, padding: "14px", width: "10%" }}>Sr No</th>
                <th style={{ ...headerCell, padding: "14px" }}>City</th>
                <th style={{ ...headerCell, padding: "14px", width: "30%" }}>State</th>
                <th style={{ ...headerCell, padding: "14px", width: "15%" }}>Status</th>
                <th style={{ ...headerCell, padding: "14px", width: "20%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentCities.length > 0 ? (
                currentCities.map((city, index) => (
                  <tr key={city.id}>
                    <td style={{ ...bodyCell, textAlign: "center", padding: "14px" }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ ...bodyCell, padding: "14px" }}>{city.name}</td>
                    <td style={{ ...bodyCell, padding: "14px" }}>{city.state}</td>
                    <td style={{ ...bodyCell, textAlign: "center", padding: "14px" }}>
                      <Switch
                        key={`${city.id}-${city.status}`}
                        checked={city.status}
                        onChange={() => toggleStatus(city.id)}
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
                    <td style={{ ...bodyCell, textAlign: "center", padding: "14px" }}>
                      <button
                        onClick={() => navigate('/edit-city', { state: city })}
                        style={{
                          backgroundColor: "#007BFF",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          marginRight: "10px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No cities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCities.length)} of{" "}
            {filteredCities.length} entries
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
    </MDBox>
  );
}
