import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Switch } from "@mui/material";
import * as XLSX from "xlsx";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, post, put } from "../../api/apiClient";
import { ENDPOINTS } from "../../api/endPoints";
import { getMainCategories } from "components/commonApi/commonApi";

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
  paddingLeft: "30px",
};

function Categories() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [entriesToShow, setEntriesToShow] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setMainCategories] = useState([]);

  useEffect(() => {
    const getMainCategory = async () => {
      try {
        const res = await getMainCategories();
        const data = res.data;
        setMainCategories(data.result); // Assume each category has `status` field
      } catch (err) {
        console.log(err);
      }
    };
    getMainCategory();
  }, []);

  const filteredCategories = categories.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(search) ||
      String(item.items || "100")
        .toLowerCase()
        .includes(search) ||
      "yes".includes(search) ||
      "no".includes(search)
    );
  });

  const totalPages = Math.ceil(filteredCategories.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + entriesToShow);

  const downloadSampleCSV = () => {
    const sampleData = [
      [
        "Category Name",
        "",
        "Category Code",
        "",
        "Subcategory Name",
        "",
        "Subcategory Code",
        "",
        "Sub-Subcategory Name",
        "",
        "Sub-Subcategory Code",
      ],
    ];

    categories.forEach((category) => {
      let firstCategoryRow = true;

      category.subcat.forEach((sub) => {
        let firstSubRow = true;

        sub.subsubcat.forEach((subsub) => {
          sampleData.push([
            firstCategoryRow ? category.name : "",
            "",
            firstCategoryRow ? category.categoryId : "",
            "",
            firstSubRow ? sub.name : "",
            "",
            firstSubRow ? sub.subCategoryId : "",
            "",
            subsub.name,
            "",
            subsub.subSubCategoryId,
          ]);

          firstCategoryRow = false;
          firstSubRow = false;
        });

        // If subcategory has NO sub-subcategories
        if (sub.subsubcat.length === 0) {
          sampleData.push([
            firstCategoryRow ? category.name : "",
            "",
            firstCategoryRow ? category.categoryId : "",
            "",
            sub.name,
            "",
            sub.subCategoryId,
            "",
            "",
            "",
            "",
          ]);

          firstCategoryRow = false;
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    // Generate & Download File
    XLSX.writeFile(workbook, "categories-codes.csv"); // or .xlsx
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

  const handleCate = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this category?");
      if (confirmDelete) {
        const result = await fetch(`https://node-m8jb.onrender.com/delete/${id}`, {
          method: "DELETE",
        });
        if (result.status === 200) {
          showAlert("success", "Deleted Successfully");
          setMainCategories((prev) => prev.filter((cat) => cat._id !== id));
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggle = async (id) => {
    const category = categories.find((cat) => cat._id === id);
    const updatedStatus = !category.status;

    const updated = categories.map((cat) =>
      cat._id === id ? { ...cat, status: updatedStatus } : cat
    );
    setMainCategories(updated);

    try {
      const res = await put(`${ENDPOINTS.EDIT_CATEGORY}/${id}`, { status: updatedStatus })

      if (res.status !== 200) {
        showAlert("error", "Failed to update status");
      }

    } catch (error) {
      console.error("Error updating status:", error);
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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Categories Lists</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all Categories</span>
            </div>

            {/* Right Buttons Wrapper */}
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
                  width: 160,
                  fontSize: 12,
                  color: "white",
                  letterSpacing: "1px",
                }}
                onClick={() => navigate("/addCategories")}
              >
                + ADD CATEGORY
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
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>Show Entries</span>&nbsp;
              <select value={entriesToShow} onChange={handleEntriesChange}>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div style={{ marginBottom: 8, display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: 16, marginBottom: 5 }}>Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name, items, public..."
                style={{
                  padding: "5px",
                  borderRadius: "20px",
                  height: "45px",
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
                  <th style={{ ...headerCell, width: "10%" }}>Sr. No</th>
                  <th style={headerCell}>Category Name</th>
                  <th style={{ ...headerCell, width: "15%" }}>Category Code</th>
                  <th style={{ ...headerCell, width: "15%" }}>Sub Categories</th>
                  <th style={headerCell}>Items</th>
                  <th style={headerCell}>Public</th>
                  <th style={{ ...headerCell, width: "20%", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((item, index) => (
                  <tr key={item._id}>
                    <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + index + 1}</td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                        <img
                          src={`${process.env.REACT_APP_IMAGE_LINK}${item.image}`}
                          alt={item.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>{item.categoryId}</td>
                    <td
                      style={{ ...bodyCell, textAlign: "center", cursor: "pointer" }}
                      onClick={() => navigate("/getsubcate", { state: { category: item } })}
                    >
                      {item.subcat ? item.subcat.length : 0}
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      {(() => {
                        const subCatCount = item.subcat ? item.subcat.length : 0;
                        const subSubCatCount = item.subcat
                          ? item.subcat.reduce((total, subcat) => {
                              return total + (subcat.subsubcat ? subcat.subsubcat.length : 0);
                            }, 0)
                          : 0;
                        return subCatCount + subSubCatCount;
                      })()}
                    </td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <Switch
                        checked={item.status}
                        onChange={() => handleToggle(item._id)}
                        color="success"
                        inputProps={{ "aria-label": "status toggle" }}
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
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <div
                        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                      >
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
                          onClick={() => navigate("/edit-sub", { state: item })}
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
                          onClick={() => handleCate(item._id)}
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
              Showing {startIndex + 1}-
              {Math.min(startIndex + entriesToShow, filteredCategories.length)} of{" "}
              {filteredCategories.length} categories
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

export default Categories;
