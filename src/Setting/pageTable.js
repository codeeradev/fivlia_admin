import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Switch } from "@mui/material";
import { ENDPOINTS } from "api/endPoints";
import { put, get } from "api/apiClient";
import { showAlert } from "components/commonFunction/alertsLoader";

export default function PagesTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(5);
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
    const getPage = async () => {
      try {
        const result = await get(ENDPOINTS.GET_PAGE);
        const data = result.data;
        if (Array.isArray(data.getPage)) {
          const pagesWithDetails = data.getPage.map((page) => ({
            id: page._id,
            title: page.pageTitle,
            slug: page.pageSlug,
            content: page.pageContent,
            status: Boolean(page.status),
          }));
          setPages(pagesWithDetails);
        } else {
          console.error("Expected array but got:", data);
        }
      } catch (err) {
        console.log("Error fetching cities:", err);
      }
    };

    getPage();
  }, []);

  const filteredPages = pages.filter((page) =>
    page.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPages.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentPages = filteredPages.slice(startIndex, endIndex);

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
    const pageToUpdate = pages.find((page) => page.id === id);
    if (!pageToUpdate) return;

    const newStatus = !pageToUpdate.status;

    try {
      await put(`${ENDPOINTS.UPDATE_PAGE_STATUS}/${id}`,{ status: newStatus });

      // Update state only after successful backend update
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === id ? { ...page, status: newStatus } : page
        )
      );
    } catch (error) {
      showAlert("error","Failed to update status. Please try again.");
      // console.error(error);
    }
  };

  const handleEdit = (city) => {
    alert(`Edit city: ${city.name}`);
  };

  // const handleDelete = async (id) => {
  //   try {
  //     if (!window.confirm("Are you sure you want to delete?")) return;

  //     const result = await fetch(
  //       `https://node-m8jb.onrender.com/deleteCity/${id}`,
  //       { method: "DELETE" }
  //     );

  //     if (result.status === 200) {
  //       setCities((prev) => prev.filter((loc) => loc.id !== id));
  //       alert("City deleted successfully.");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Page Lists</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>View and manage all pages</p>
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
            onClick={() => navigate("/add-page")}
          >
            + Add Page
          </Button>
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
                <th style={{ ...headerCell, padding: "14px" }}>Page Title</th>
                <th style={{ ...headerCell, padding: "14px", width: "30%" }}>Slug</th>
                <th style={{ ...headerCell, padding: "14px", width: "15%" }}>Status</th>
                <th style={{ ...headerCell, padding: "14px", width: "20%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPages.length > 0 ? (
                currentPages.map((page, index) => (
                  <tr key={page.id}>
                    <td style={{ ...bodyCell, textAlign: "center", padding: "14px" }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ ...bodyCell, padding: "14px" }}>{page.title}</td>
                    <td style={{ ...bodyCell, padding: "14px" }}>{page.slug}</td>
                    <td style={{ ...bodyCell, textAlign: "center", padding: "14px" }}>
                      <Switch
                        key={`${page.id}-${page.status}`}
                        checked={page.status}
                        onChange={() => toggleStatus(page.id)}
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
                        onClick={() => navigate('/edit-page', { state: page })}
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
                      {/* <button
                        onClick={() => handleDelete(city.id)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button> */}
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPages.length)} of{" "}
            {filteredPages.length} entries
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
