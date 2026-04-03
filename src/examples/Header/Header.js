// Header.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Badge,
  Avatar,
  Box,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton as MuiIconButton,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import LaunchIcon from "@mui/icons-material/Launch";
import { useMaterialUIController, setMiniSidenav } from "context";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import { get, del, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function Header() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;

  const [anchorNotif, setAnchorNotif] = useState(null);
  const [anchorProfile, setAnchorProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const handleToggleSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleProfileOpen = (e) => setAnchorProfile(e.currentTarget);
  const handleProfileClose = () => setAnchorProfile(null);

  // unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // fetch notifications from backend
  const fetchOldNotifications = async () => {
    try {
      const res = await get(`${ENDPOINTS.GET_NOTIFICATION}?type=admin`);
      const data = res.data;
      if (data && data.notifications) {
        // ensure array sorted by createdAt desc
        const sorted = [...data.notifications].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  // mark all read (called when opening the dropdown)
  const handleNotifOpen = async (e) => {
    setAnchorNotif(e.currentTarget);

    try {
      await put(ENDPOINTS.MARK_ALL_READ);

      // optimistic UI update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleNotifClose = () => setAnchorNotif(null);

  // toggle delete slide
const toggleDelete = (id) => {
  setNotifications((prev) =>
    prev.map((n) =>
      n._id === id ? { ...n, _showDelete: !n._showDelete } : n
    )
  );
};

  // delete single notification
  const handleDelete = async (id) => {
    try {
      // optimistic remove
      setNotifications((prev) => prev.filter((n) => n._id !== id));

      const res = await del(`${ENDPOINTS.DELETE_NOTIFICATION}/${id}`);
      if (res.status !== 200) {
        console.error("Delete failed, refetching notifications");
        fetchOldNotifications();
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      fetchOldNotifications();
    }
  };

  // navigate to the screen specified in notification (use screen field)
  const handleNavigate = (screen, data) => {
    handleNotifClose();
    if (!screen) return;
    // If screen contains params like /orders or /orders/oid
    // Prefer client-side navigation if route exists
    try {
      // Example: if you store orderId in data, you might want to append it
      // We'll navigate directly to screen (backend provided) — adapt if needed.
      navigate(screen);
    } catch (err) {
      // fallback
      window.location.href = screen;
    }
  };

  // socket + initial fetch
  useEffect(() => {
    fetchOldNotifications();

    const s = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"],
    });

    s.emit("joinAdmin");

    s.on("newNotification", (data) => {
      // ensure _id field exists in incoming data
      const id = data._id || data.id;
      const normalized = { ...data, _id: id };

      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === normalized._id);
        if (exists) {
          // if exists and incoming is newer, replace
          const updated = prev.map((n) => (n._id === normalized._id ? { ...n, ...normalized } : n));
          return updated;
        }
        return [normalized, ...prev];
      });
    });

    // optional: handle socket reconnection, errors
    s.on("connect_error", (err) => {
      console.warn("Socket connect error:", err);
    });

    return () => s.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to format date/time nicely
  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={({ palette }) => ({
        backgroundColor: darkMode ? palette.background.paper : palette.background.default,
        color: darkMode ? "#fff" : palette.text.primary,
        borderBottom: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e0e0e0",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        height: "72px",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: "flex",
        justifyContent: "center",
      })}
    >
      <Toolbar
        sx={{
          width: "100%",
          maxWidth: "1600px",
          mx: "auto",
          minHeight: "70px !important",
          px: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="inherit"
            onClick={handleToggleSidenav}
            sx={{
              borderRadius: "10px",
              p: 1,
              backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#f1f3f4",
              "&:hover": {
                backgroundColor: darkMode ? "rgba(255,255,255,0.15)" : "#e4e7eb",
              },
              transition: "all 0.2s ease",
            }}
          >
            <MenuIcon fontSize="medium" />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.3,
              fontSize: "1.1rem",
              color: darkMode ? "#fff" : "#111",
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotifOpen}
              sx={{
                backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#f1f3f4",
                "&:hover": { backgroundColor: darkMode ? "rgba(255,255,255,0.15)" : "#e4e7eb" },
                borderRadius: "10px",
                p: 1,
                transition: "all 0.2s ease",
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorNotif}
            open={Boolean(anchorNotif)}
            onClose={handleNotifClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: "0px 6px 20px rgba(0,0,0,0.12)",
                minWidth: 320,
                maxHeight: 420,
                overflowY: "auto",
                p: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "#c1c1c1", borderRadius: "6px" },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                Notifications
              </Typography>
            </Box>
            <Divider />

            {notifications.length === 0 ? (
              <MenuItem sx={{ justifyContent: "center" }}>No notifications</MenuItem>
            ) : (
              <List disablePadding>
                {notifications.map((n) => (
                  <ListItem
                    key={n._id}
                    disableGutters
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    {/* Slide delete button */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "80px",
                        backgroundColor: "error.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        cursor: "pointer",
                        transform: n._showDelete ? "translateX(0)" : "translateX(100%)",
                        transition: "transform 0.3s ease",
                        zIndex: 2,
                      }}
                      onClick={() => handleDelete(n._id)}
                    >
                      Delete
                    </Box>

                    {/* Main Notification Row */}
                    <Box
                      onClick={() => {
                        // If delete is open, close it instead of navigating
                        if (n._showDelete) {
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item._id === n._id ? { ...item, _showDelete: false } : item
                            )
                          );
                          return;
                        }
                        handleNavigate(n.screen, n.data);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        // long press → show delete
                        setNotifications((prev) =>
                          prev.map((item) =>
                            item._id === n._id ? { ...item, _showDelete: true } : item
                          )
                        );
                      }}
                      onDoubleClick={() => {
                        // double tap → toggle delete
                        setNotifications((prev) =>
                          prev.map((item) =>
                            item._id === n._id ? { ...item, _showDelete: !item._showDelete } : item
                          )
                        );
                      }}
                      sx={{
                        p: 1,
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-start",
                        bgcolor: !n.isRead ? "rgba(0,123,255,0.06)" : "background.paper",
                        transform: n._showDelete ? "translateX(-80px)" : "translateX(0)",
                        transition: "transform 0.3s ease, background-color 0.3s",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: n.type === "order" ? "primary.main" : "secondary.main",
                            width: 36,
                            height: 36,
                          }}
                        >
                          {n.type ? n.type[0].toUpperCase() : "N"}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography sx={{ fontWeight: 700 }}>{n.title}</Typography>
                            <Typography sx={{ fontSize: 11, opacity: 0.7 }}>
                              {formatDate(n.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography sx={{ fontSize: 13, opacity: 0.7 }}>
                            {n.description}
                          </Typography>
                        }
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Menu>

          {/* Profile */}
          <Tooltip title="Account">
            <IconButton
              color="inherit"
              onClick={handleProfileOpen}
              sx={{
                borderRadius: "10px",
                p: 0.5,
                backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#f1f3f4",
                "&:hover": { backgroundColor: darkMode ? "rgba(255,255,255,0.15)" : "#e4e7eb" },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  color: "white",
                  fontSize: 20,
                }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorProfile}
            open={Boolean(anchorProfile)}
            onClose={handleProfileClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                minWidth: 170,
                p: 0.5,
              },
            }}
          >
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <Divider />
            <MenuItem sx={{ color: "error.main" }}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
