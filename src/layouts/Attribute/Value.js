import React, { useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function Attributes() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const SaveValue = async () => {
    try {
      if (!name) {
        showAlert("error", "Invalid Attribute Name");
        return;
      }
      showAlert("loading", "Saving attribute...");

      await post(ENDPOINTS.ADD_ATTRIBUTE, {
        Attribute_name: name.trim(),
      });

      showAlert("success", "Attribute added successfully");
      navigate(-1);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to add attribute");
    }
  };
  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="container">
        <div className="inner-div" style={{ width: "100%" }}>
          <div className="form-header">CREATE ITEM ATTRIBUTE</div>

          <div>
            <div>
              <label>Attribute Name</label>
              <input
                type="text"
                placeholder="Insert Attribute Name"
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

export default Attributes;
