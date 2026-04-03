import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom";
import { Switch } from "@mui/material";
import { showAlert } from "components/commonFunction/alertsLoader";
import { put, get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

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

function GetSubCategories() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const category = location.state?.category;
  const [toggleStates, setToggleStates] = useState({});

  useEffect(() => {
    const initialToggles = {};
    category?.subcat?.forEach((item) => {
      initialToggles[item._id] = item.status ?? true; // status from backend
    });
    setToggleStates(initialToggles);

    const getSubCate = async () => {
      try {
        showAlert("loading", "Loading sub-categories...");

        const res = await get(`${ENDPOINTS.GET_SUB_CATEGORIES}/${category._id}`);
        const result = res.data;

        setData(result.subcategories);

        // Set toggle state based on actual backend data
        const toggleMap = {};
        result.subcategories.forEach((subcat) => {
          toggleMap[subcat._id] = subcat.status ?? true;
        });
        setToggleStates(toggleMap);
        showAlert("success", "Loaded successfully");
      } catch (err) {
        console.log(err);
        showAlert("error", "An error occurred");
      }
    };

    getSubCate();
  }, []);

  const handleToggle = async (id) => {
    const updatedStatus = !toggleStates[id];

    // Optimistically update UI
    setToggleStates((prev) => ({
      ...prev,
      [id]: updatedStatus,
    }));

    try {
      showAlert("loading", "Updating status...");

      const response = await put(`${ENDPOINTS.EDIT_CATEGORY}/${id}`, {
        status: updatedStatus,
      });

      if (response.status === 200) {
        showAlert("success", updatedStatus ? "Sub-category enabled" : "Sub-category disabled");
      } else {
        showAlert("error", "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert("error", "Error updating sub-category status");
    }
  };

  const handleDeleteSubcat = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this sub-category?");
    if (!confirm) return;

    try {
      const res = await fetch(`https://node-m8jb.onrender.com/delete-subcategory/${id}`, {
        method: "DELETE",
      });
      if (res.status === 200) {
        alert("Deleted successfully");
        const updatedList = data.filter((item) => item._id !== id);
        setData(updatedList);

        if (updatedList.length === 0) {
          navigate(-1);
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
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
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontWeight: "bold", fontSize: 26 }}>Sub-Categories List</span>
            <br />
            <span style={{ fontSize: 17 }}>
              View and manage all Sub-Categories of {category?.name}
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...headerCell, width: "8%" }}>Sr. No</th>
                  <th style={headerCell}>Sub-Category Name</th>
                  <th style={headerCell}>Sub-Category Code</th>
                  <th style={{ ...headerCell, width: "20%" }}>Sub Sub-Categories</th>
                  <th style={headerCell}>Items</th>
                  <th style={headerCell}>Public</th>
                  <th style={{ ...headerCell, width: "20%", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((subcatItem, index) => {
                  const subSubCount = subcatItem.subsubcat?.length || 0;
                  const totalItems = 1 + subSubCount;

                  return (
                    <tr key={subcatItem._id}>
                      <td style={{ ...bodyCell, textAlign: "center" }}>{index + 1}</td>
                      <td style={{ ...bodyCell }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                          }}
                        >
                          <img
                            src={subcatItem.image}
                            alt={subcatItem.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <span>{subcatItem.name}</span>
                        </div>
                      </td>
                      <td
                        style={{
                          ...bodyCell,
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        {subcatItem.subCategoryId}
                      </td>

                      <td
                        style={{
                          ...bodyCell,
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate("/getsubsubcat", {
                            state: { subcat: subcatItem },
                          })
                        }
                      >
                        {subSubCount}
                      </td>
                      <td style={{ ...bodyCell, textAlign: "center" }}>{totalItems}</td>
                      <td style={{ ...bodyCell, textAlign: "center" }}>
                        <Switch
                          checked={toggleStates[subcatItem._id] || false}
                          onChange={() => handleToggle(subcatItem._id)}
                          color="primary"
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
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "10px",
                          }}
                        >
                          <button
                            style={{
                              backgroundColor: "#007BFF",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate("/edit-subCat", {
                                state: subcatItem,
                              })
                            }
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
                            onClick={() => handleDeleteSubcat(subcatItem._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default GetSubCategories;
