import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import * as XLSX from "xlsx";
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

function BrandTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        showAlert("loading", "Loading brands...");

        const res = await get(ENDPOINTS.GET_BRANDS);
        const data = res.data;
        // Use allBrands from the API response
        setBrands(data.allBrands || []);
        showAlert("success", "Brands loaded");
      } catch (err) {
        console.error("Error fetching brands:", err);
        showAlert("error", "Failed to load brands");
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((item) =>
    item.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentBrands = filteredBrands.slice(startIndex, startIndex + entriesToShow);

  const downloadSampleCSV = () => {
    const sampleData = brands.map((item) => ({
      "Brand Name": `${item.brandName}`,
      " ": ` `,
      "Brand Code": `${item.brandId}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "brands");

    // Generate & Download File
    XLSX.writeFile(workbook, "brand-codes.csv"); // or .xlsx
  };

  const handleEntriesChange = (e) => {
    setEntriesToShow(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleDeleteBrand = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this brand?");
      if (!confirmDelete) return;

      const res = await fetch(`https://node-m8jb.onrender.com/deleteBrand/${id}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        setBrands((prev) => prev.filter((b) => b._id !== id));
        showAlert("success", "Deleted successfully!");
      }
    } catch (err) {
      console.log("Delete failed:", err);
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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Brands List</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all brands</span>
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
                    height: 45,
                    width: 150,
                    fontSize: 14,
                    color: "white",
                    letterSpacing: "1px",
                  }}
                  onClick={() => navigate("/add-brand")}
                >
                  + ADD BRAND
                </Button>
              </div>
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
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>Show Entries</span> 
              <select value={entriesToShow} onChange={handleEntriesChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 16 }}>Search</label>
              <br />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Brand..."
                style={{
                  padding: "5px",
                  borderRadius: "20px",
                  height: "40px",
                  width: "200px",
                  border: "1px solid #ccc",
                  fontSize: 17,
                  paddingLeft: "15px",
                }}
              />
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
                  <th style={headerCell}>Brand Name</th>
                  <th style={headerCell}>Brand Code</th>
                  <th style={headerCell}>Brand Logo</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBrands.map((item, index) => (
                  <tr key={item._id}>
                    <td style={bodyCell}>{startIndex + index + 1}</td>
                    <td style={bodyCell}>{item.brandName}</td>
                    <td style={bodyCell}>{item.brandId}</td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${item.brandLogo}`}
                        alt="logo"
                        width="70"
                        height="70"
                        style={{ borderRadius: "100%" }}
                      />
                    </td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button
                          style={{
                            backgroundColor: "#007BFF",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate("/edit-brand", { state: item })}
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
                          onClick={() => handleDeleteBrand(item._id)}
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

          {/* Pagination */}
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
              Showing {startIndex + 1}-{Math.min(startIndex + entriesToShow, filteredBrands.length)}{" "}
              of {filteredBrands.length} brands
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

export default BrandTable;
