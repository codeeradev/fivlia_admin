import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { get } from "api/apiClient";
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

function UnitsTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        showAlert("loading", "Fetching Units...");
        const res = await get(ENDPOINTS.GET_UNIT);
        const data = res.data;
        setUnits(data.Result);
        showAlert("success", "Units loaded successfully");
      } catch (err) {
        console.error("Error fetching locations:", err);
        showAlert("error", "Failed to load units");
      }
    };
    fetchUnits();
  }, []);

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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Units Lists</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all units</span>
            </div>
            <div>
              <Button
                style={{
                  backgroundColor: "#00c853",
                  height: 50,
                  width: 170,
                  fontSize: 15,
                  color: "white",
                  letterSpacing: "1px",
                }}
                onClick={() => navigate("/add-unit")}
              >
                + Add Unit
              </Button>
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
                  <th style={headerCell}>Item Units Name</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {units.map((item, index) => (
                  <tr key={item._id}>
                    <td style={bodyCell}>{index + 1}</td>
                     <td style={bodyCell}>{item.unitname}</td>
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
                          onClick={()=>navigate('/edit-unit',{state:item})}
                        >
                          Edit
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
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default UnitsTable;
