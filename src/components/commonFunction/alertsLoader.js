import React, { useState, useEffect } from "react";
import { Snackbar, Alert, CircularProgress, Backdrop, Fade, Typography, Box } from "@mui/material";

// This will hold the update function from the provider
let setGlobalNotify;

/**
 * Global alert / loader function
 * @param {string} type - success | error | warning | info | loading
 * @param {string} message - The message to show
 * @param {number} duration - Time to auto-hide (ms)
 */
export const showAlert = (type = "info", message = "", duration = 3000) => {
  if (!setGlobalNotify) {
    console.warn("⚠️ showAlert() called before AlertProvider mounted");
    return;
  }
  setGlobalNotify({
    open: true,
    type,
    message,
    duration,
  });
};

// --- Provider Component ---
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    type: "info",
    message: "",
    duration: 3000,
  });

  // Expose setter globally
  useEffect(() => {
    setGlobalNotify = setAlert;
  }, []);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      {children}

      {/* Snackbar Alerts */}
      <Snackbar
        open={alert.open && alert.type !== "loading"}
        autoHideDuration={alert.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          severity={alert.type}
          variant="filled"
          elevation={6}
          sx={{
            fontSize: "0.95rem",
            borderRadius: "10px",
            minWidth: "280px",
            boxShadow: 3,
          }}
          onClose={handleClose}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Fullscreen Loading Overlay */}
      <Backdrop
        sx={{
          color: "#333",
          zIndex: (theme) => theme.zIndex.drawer + 100,
          backdropFilter: "blur(6px)",
          background: "rgba(255, 255, 255, 0.6)",
        }}
        open={alert.open && alert.type === "loading"}
      >
        <Box
          textAlign="center"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
          borderRadius="16px"
          sx={{
            background: "linear-gradient(135deg, #ffffff 0%, #ffffff 100%)",
            boxShadow: "0 8px 24px rgba(0, 123, 255, 0.25)",
            border: "1px solid rgba(0, 123, 255, 0.2)",
            animation: "fadePulse 1.8s ease-in-out infinite",
            "@keyframes fadePulse": {
              "0%": { boxShadow: "0 0 10px rgba(0,123,255,0.1)" },
              "50%": { boxShadow: "0 0 25px rgba(0,123,255,0.35)" },
              "100%": { boxShadow: "0 0 10px rgba(0,123,255,0.1)" },
            },
          }}
        >
          <CircularProgress
            size={60}
            thickness={4.5}
            sx={{
              color: "#007bff",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              letterSpacing: "0.4px",
              color: "#007bff",
            }}
          >
            {alert.message || "Processing... Please wait"}
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};
