import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Switch } from "@mui/material";
import { get, patch } from "api/apiClient";
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
  verticalAlign: "middle",
};

function BannerManagement() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getBanner = async () => {
      try {
        showAlert("loading", "Fetching banners...");

        const response = await get(ENDPOINTS.GET_ALL_BANNER);
        const bannersArray = response.data;
        if (Array.isArray(bannersArray)) {
          const bannerWithStatus = bannersArray.map((banner) => ({
            ...banner, // ✅ include full data
            public: banner.status === true,
          }));
          setBanners(bannerWithStatus);
          showAlert("success", "Banners loaded");
        } else {
          showAlert("error", "Invalid banner response");
        }
      } catch (error) {
        showAlert("error", "Failed to load banners");
      }
    };

    getBanner();
  }, []);

  const togglePublic = async (banner) => {
    const newStatus = !banner.public;

    try {
      showAlert("loading", "Updating banner status...");

      await patch(`${ENDPOINTS.UPDATE_BANNER_STATUS}/${banner._id}/status`, {
        status: newStatus,
        zoneId: banner?.zones?.[0]?._id,
      });

      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, status: newStatus, public: newStatus } : b))
      );
      showAlert("success", "Status updated");
    } catch (err) {
      console.error("Network error:", err);
      showAlert("error", "Failed to update status");
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this banner?");
    if (!confirmDelete) return;

    try {
      const result = await fetch(`https://node-m8jb.onrender.com/bannerdelete/${bannerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (result.status === 200) {
        alert("Banner Deleted Successfully");
        setBanners((prev) => prev.filter((b) => b._id !== bannerId));
      } else {
        alert("Try again later");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const filteredBanners = banners.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(search) ||
      item.type?.toLowerCase().includes(search) ||
      (item.city && Array.isArray(item.city)
        ? item.city.some((c) => c.name.toLowerCase().includes(search))
        : item.city?.name?.toLowerCase().includes(search))
    );
  });

  const totalPages = Math.ceil(filteredBanners.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentBanners = filteredBanners.slice(startIndex, startIndex + entriesToShow);

  return (
    <MDBox
      p={{ xs: 1, sm: 1.5, md: 2 }}
      sx={{
        ml: { xs: 0, lg: miniSidenav ? "80px" : "250px" },
        transition: "margin-left 0.3s ease",
      }}
    >
      <div className="banner-container">
        <div className="add-banner-box" style={{ width: "100%", borderRadius: 15, padding: 20 }}>
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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Banner Lists</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all Banners</span>
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
                onClick={() => navigate("/add-banner")}
              >
                + ADD BANNER
              </Button>
            </div>
          </div>

          {/* Search + Show Entries */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 16 }}>Show Entries</label>&nbsp;
              <select
                value={entriesToShow}
                onChange={(e) => {
                  setEntriesToShow(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 16 }}>Search</label>
              <br />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, type or city"
                style={{
                  padding: "10px",
                  borderRadius: "20px",
                  border: "1px solid #ccc",
                  width: "200px",
                  fontSize: 16,
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 15 }}>
              <thead>
                <tr>
                  <th style={headerCell}>Sr. No</th>
                  <th style={headerCell}>Banner Name</th>
                  <th style={headerCell}>Type</th>
                  <th style={headerCell}>City</th>
                  <th style={headerCell}>Public</th>
                  <th style={{ ...headerCell, width: "20%", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBanners.map((item, index) => (
                  <tr key={item._id}>
                    <td style={bodyCell}>{startIndex + index + 1}</td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <img
                          src={`${process.env.REACT_APP_IMAGE_LINK}${item.image}`}
                          alt={item.title}
                          style={{ width: 50, height: 50, borderRadius: 5, objectFit: "cover" }}
                        />
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td style={bodyCell}>{item.type}</td>
                    <td style={bodyCell}>
                      {Array.isArray(item.city)
                        ? item.city.map((c) => c.name).join(", ")
                        : item.city?.name || "N/A"}
                    </td>

                    <td style={bodyCell}>
                      <Switch
                        checked={item.public}
                        onChange={() => togglePublic(item)}
                        color="primary"
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
                      <button
                        style={{
                          backgroundColor: "#007bff",
                          color: "#fff",
                          padding: "8px 16px",
                          border: "none",
                          borderRadius: "5px",
                          marginRight: 8,
                          cursor: "pointer",
                        }}
                        onClick={() => navigate("/edit-banner", { state: item })}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          padding: "8px 16px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDeleteBanner(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentBanners.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...bodyCell, textAlign: "center" }}>
                      No banners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              marginTop: 15,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 16 }}>
              Showing {startIndex + 1} to {startIndex + currentBanners.length} of{" "}
              {filteredBanners.length} entries
            </span>
            <div>
              <Button
                variant="outlined"
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{ marginRight: 8 }}
              >
                {"<"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                {">"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default BannerManagement;
