// src/layouts/SEO/Etc.jsx
import React from "react";
import MDBox from "components/MDBox";
import { Typography, TextField, Button } from "@mui/material";
import { useMaterialUIController } from "context";

export default function Etc() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDesc, setMetaDesc] = React.useState("");

  const handleSave = () => {
    alert("SEO defaults saved!");
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={3} sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Other SEO Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Set your default meta tags and OpenGraph values here.
      </Typography>

      <TextField
        label="Default Meta Title"
        fullWidth
        margin="normal"
        value={metaTitle}
        onChange={(e) => setMetaTitle(e.target.value)}
      />
      <TextField
        label="Default Meta Description"
        fullWidth
        margin="normal"
        multiline
        minRows={3}
        value={metaDesc}
        onChange={(e) => setMetaDesc(e.target.value)}
      />

      <Button
        onClick={handleSave}
        sx={{
          mt: 2,
          backgroundColor: "#00c853",
          color: "white",
          px: 3,
          py: 1.2,
          "&:hover": { backgroundColor: "#00b04f" },
        }}
      >
        Save
      </Button>
    </MDBox>
  );
}
