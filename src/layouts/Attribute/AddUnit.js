import React, { useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function AddUnit() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const SaveValue = async () => {
    try {
      if (!name) {
        showAlert("error", "Invalid unit name");
        return;
      }
      showAlert("loading", "Saving unit...");
      await post(ENDPOINTS.ADD_UNIT, {
        unitname: name.trim(),
      });

      showAlert("success", "Unit added successfully");
      navigate(-1);
    } catch (err) {
      console.log(err);
      showAlert("error", "Error adding unit");
    }
  };
  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="container">
        <div className="inner-div" style={{ width: "100%" }}>
          <div className="form-header">CREATE ITEM UNITS</div>

          <div>
            <div>
              <label>Unit Name</label>
              <input
                type="text"
                placeholder="Insert Unit Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginTop: "10px" }}
              />
            </div>
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

export default AddUnit;
