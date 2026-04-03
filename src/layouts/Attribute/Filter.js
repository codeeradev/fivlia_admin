import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@mui/material";
import { get, del } from "api/apiClient";
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

function Filter() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [filterdata, setFilterData] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        showAlert("loading", "Fetching filters...");

        const res = await get(ENDPOINTS.GET_FILTERS);
        setFilterData(res.data);

        showAlert("success", "Filters loaded successfully");
      } catch (err) {
        console.error("Error fetching Filters:", err);
        showAlert("error", "Failed to load filters");
      }
    };
    fetchFilters();
  }, []);

  const handleRemoveFilterValue = async (id, name) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Variant?");
    if (!confirmDelete) return;
    try {
      showAlert("loading", "Deleting value...");

      await del(`${ENDPOINTS.DELETE_FILTER_VALUE}/${id}`);

      // Update UI locally
      setFilterData((prev) =>
        prev.map((filter) => ({
          ...filter,
          Filter: filter.Filter.filter((item) => item._id !== id),
        }))
      );

      showAlert("success", "Value deleted successfully");
    } catch (err) {
      console.error("Error deleting filter value:", err);
      showAlert("error", "Failed to delete value");
    }
  };

  const handleDeleteFilter = async (filterId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Filter?");
    if (!confirmDelete) return;
    try {
      showAlert("loading", "Deleting filter...");

      await del(`${ENDPOINTS.DELETE_FILTER}/${filterId}`);

      setFilterData((prevFilters) => prevFilters.filter((filter) => filter._id !== filterId));

      showAlert("success", "Filter deleted successfully");
    } catch (error) {
      console.error("Error deleting filter:", error);
      showAlert("error", "Failed to delete filter");
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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Filter Type Lists</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all filters</span>
            </div>
            <div>
              <Button
                style={{
                  backgroundColor: "#00c853",
                  height: 50,
                  width: 170,
                  fontSize: 12,
                  color: "white",
                  letterSpacing: "1px",
                }}
                onClick={() => navigate("/add-filter")}
              >
                + Add Filter
              </Button>
            </div>
          </div>

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
                  <th style={headerCell}>Filter Type</th>
                  <th style={headerCell}>Filter Value</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filterdata.map((item, index) => (
                  <tr key={item._id}>
                    <td style={{ ...bodyCell, textAlign: "center" }}>{index + 1}</td>
                    <td style={bodyCell}>{item.Filter_name}</td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {item.Filter && item.Filter.length > 0 ? (
                          item.Filter.map((filterItem, idx) => (
                            <Chip
                              key={idx}
                              label={filterItem.name}
                              onDelete={() =>
                                handleRemoveFilterValue(filterItem._id, filterItem.name)
                              }
                              style={{
                                backgroundColor: "#e0f7fa",
                                color: "#00796b",
                                fontWeight: "bold",
                                fontSize: "14px",
                                borderRadius: "16px",
                              }}
                              deleteIcon={
                                <span
                                  style={{
                                    fontSize: "16px",
                                    color: "red",
                                    cursor: "pointer",
                                    marginRight: "10px",
                                  }}
                                >
                                  ×
                                </span>
                              }
                            />
                          ))
                        ) : (
                          <span style={{ color: "#aaa" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td style={bodyCell}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate("/edit-filter", { state: item })}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleDeleteFilter(item._id)}
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
          ></div>
        </div>
      </div>
    </MDBox>
  );
}

export default Filter;
