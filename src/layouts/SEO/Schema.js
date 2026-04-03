// src/layouts/SEO/Schema.jsx
import React, { useState } from "react";
import MDBox from "components/MDBox";
import { Typography, TextField, Button, Alert } from "@mui/material";
import { useMaterialUIController } from "context";

export default function Schema() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [schema, setSchema] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    try {
      // Example API call to save schema
      // await fetch(`${process.env.REACT_APP_API_URL}/saveSchema`, { method: "POST", body: JSON.stringify({ schema }) });
      setMessage("✅ Schema markup saved successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("❌ Failed to save schema");
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={3} sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Schema
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Add or update your JSON-LD schema markup for rich search results.
      </Typography>

      <TextField
        label="Schema JSON-LD"
        fullWidth
        multiline
        minRows={8}
        value={schema}
        onChange={(e) => setSchema(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button variant="contained" color="primary" onClick={handleSave}>
        Save Schema
      </Button>

      {message && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </MDBox>
  );
}
