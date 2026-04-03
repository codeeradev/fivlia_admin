import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { get, del } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";
import * as XLSX from "xlsx";

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

function AttributeTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [attribute, setAttribute] = useState([]);

  const downloadSampleCSV = () => {
    const sampleData = [["Attribute Name", "", "Variant Name", "", "Variant Code"]];

    attribute.forEach((attr) => {
      let firstRow = true;

      attr.varient.forEach((variant) => {
        sampleData.push([
          firstRow ? attr.Attribute_name : "", // Only for first row
          "",
          variant.name,
          "",
          variant.variantId,
        ]);

        firstRow = false; // Remaining rows will have empty attribute
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attributes");

    // Generate & Download File
    XLSX.writeFile(workbook, "attributes-codes.csv"); // or .xlsx
  };

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        showAlert("loading", "Fetching attributes...");

        const res = await get(ENDPOINTS.GET_ATTRIBUTES);
        setAttribute(res.data);

        showAlert("success", "Attributes loaded successfully");
      } catch (err) {
        console.error("Error fetching attributes:", err);
        showAlert("error", "Failed to load attributes");
      }
    };
    fetchAttribute();
  }, []);

  const handleRemoveVariant = async (variantId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Variant?");
    if (!confirmDelete) return;
    try {
      showAlert("loading", "Deleting variant...");

      await del(`${ENDPOINTS.DELETE_VARIANT}/${variantId}`);

      setAttribute((prevAttributes) =>
        prevAttributes.map((attr) => ({
          ...attr,
          varient: attr.varient.filter((v) => v._id !== variantId),
        }))
      );
      showAlert("success", "Variant deleted successfully");
    } catch (error) {
      console.error("Error deleting variant:", error);
      showAlert("error", "Failed to delete variant");
    }
  };

  const handleDeleteAttribute = async (attributeId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Attribute?");
    if (!confirmDelete) return;
    try {
      showAlert("loading", "Deleting attribute...");

      await del(`${ENDPOINTS.DELETE_ATTRIBUTE}/${attributeId}`);

      setAttribute((prevAttributes) => prevAttributes.filter((attr) => attr._id !== attributeId));

      showAlert("success", "Attribute deleted successfully");
    } catch (error) {
      console.error("Error deleting attribute:", error);
      showAlert("error", "Failed to delete attribute");
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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Attribute Lists</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all attributes</span>
            </div>
            <div>
              <div style={{ display: "flex", gap: 15 }}>
                <Button
                  style={{
                    backgroundColor: "#1976d2",
                    height: 45,
                    width: 160,
                    fontSize: 12,
                    color: "white",
                    letterSpacing: "1px",
                  }}
                  onClick={downloadSampleCSV}
                >
                  Download Sample CSV
                </Button>
                <Button
                  style={{
                    backgroundColor: "#00c853",
                    height: 50,
                    width: 170,
                    fontSize: 12,
                    color: "white",
                    letterSpacing: "1px",
                  }}
                  onClick={() => navigate("/attribute-value")}
                >
                  + Add Attribute
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
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
                  <th style={headerCell}>Item Attribute Name</th>
                  <th style={headerCell}>Attribute Code</th>
                  <th style={headerCell}>Item Variants Value</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attribute.map((item, index) => (
                  <tr key={item._id}>
                    <td style={bodyCell}>{index + 1}</td>
                    <td style={bodyCell}>{item.Attribute_name}</td>
                    <td style={bodyCell}>{item.attributeId}</td>
                    <td style={bodyCell}>
                      {item.varient && item.varient.length > 0 ? (
                        item.varient.map((v, i) => (
                          <span
                            key={i}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              backgroundColor: "#e0f7fa",
                              color: "#00796b",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              marginRight: "6px",
                              marginBottom: "4px",
                              fontSize: "14px",
                              userSelect: "none",
                            }}
                          >
                            {v.name}
                            <button
                              onClick={() => handleRemoveVariant(v._id)}
                              style={{
                                marginLeft: 6,
                                background: "transparent",
                                border: "none",
                                color: "#00796b",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "16px",
                                lineHeight: 1,
                                padding: 0,
                              }}
                              aria-label={`Remove variant ${v.name}`}
                              type="button"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "#aaa" }}>—</span>
                      )}
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
                          onClick={() => navigate("/edit-all", { state: item })}
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
                          onClick={() => handleDeleteAttribute(item._id)}
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

export default AttributeTable;
