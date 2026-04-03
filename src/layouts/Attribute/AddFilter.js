import React, { useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function AddFilter() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");
  const [filterData, setFilterData] = useState([]);

  const SaveValue = async () => {
    try {
      if (!name) {
        showAlert("error", "Invalid Name");
        return;
      }
      showAlert("loading", "Saving filter...");
      const formattedFilter = filterData.map((item) => ({ name: item }));
      await post(ENDPOINTS.ADD_FILTER, {
        Filter_name: name,
        Filter: formattedFilter,
      });

      showAlert("success", "Filter added successfully");

      navigate(-1);
    } catch (err) {
      console.error(err);
      showAlert("error", "Error adding filter");
    }
  };

  const handleAddFilter = () => {
    if (filter.trim() === "") return;

    if (!filterData.includes(filter.trim())) {
      setFilterData([...filterData, filter.trim()]);
      setFilter("");
    }
  };

  const handleRemoveFilter = (value) => {
    const updated = filterData.filter((item) => item !== value);
    setFilterData(updated);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="container">
        <div className="inner-div" style={{ width: "100%" }}>
          <div className="form-header">CREATE NEW FILTER TYPE</div>

          <div>
            <label>Filter Name</label>
            <input
              type="text"
              placeholder="Insert Filter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginTop: "10px" }}
            />
          </div>

          <div style={{ marginTop: "25px" }}>
            <label>Filter Value</label>
            <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
              <input
                type="text"
                placeholder="Insert Filter Value"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ marginTop: "10px" }}
              />
              <Button
                style={{
                  backgroundColor: "#00c853",
                  height: "30px",
                  marginTop: "10px",
                  color: "white",
                }}
                onClick={handleAddFilter}
              >
                ADD
              </Button>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {filterData.map((item, index) => (
              <Chip
                key={index}
                label={item}
                onDelete={() => handleRemoveFilter(item)}
                deleteIcon={<CloseIcon style={{ fontSize: "16px", color: "red" }} />}
                style={{
                  backgroundColor: "#ffffff",
                  fontWeight: "bold",
                  boxShadow: "1px 2px 6px rgba(0, 0, 0, 0.2)",
                  borderRadius: "20px",
                  padding: "4px 10px",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "30px",
              marginTop: "40px",
            }}
          >
            <Button
              style={{
                backgroundColor: "#00c853",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={SaveValue}
            >
              SAVE
            </Button>
            <Button
              style={{
                backgroundColor: "#00c853",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={() => navigate(-1)}
            >
              BACK
            </Button>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default AddFilter;
