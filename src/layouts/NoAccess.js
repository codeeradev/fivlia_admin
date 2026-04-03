import React from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import getFirstAllowedRoute from "components/RoleBaseFunction/firstAllowedRoute";
import routes from "routes";
export default function NoAccess() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          background: "white",
          padding: 4,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700" }}>Access Denied</h1>

        <p style={{ marginTop: 10, fontSize: "16px", color: "#555" }}>
          You do not have permission to access this page.
        </p>

        <Button
          variant="contained"
          fullWidth
          onClick={() =>
            navigate(
              getFirstAllowedRoute(
                routes,
                JSON.parse(localStorage.getItem("adminUser"))?.permissions || []
              )
            )
          }
          sx={{
            marginTop: 3,
            backgroundColor: "#007bff",
            height: 45,
            color: "white !important",
            fontWeight: "bold",
          }}
        >
          Go Back
        </Button>
      </Box>
    </Box>
  );
}
