import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { api } from "api/apiClient";

const OTHER = "__other__";

const statusOf = (order) =>
  String(order?.orderStatus || "").trim().toLowerCase();

export const isGlobalOrder = (order) => order?.serviceScope === "global";

export const canShipOrder = (order) =>
  isGlobalOrder(order) &&
  ["accepted", "ready", "ready to pickup"].includes(statusOf(order));

export const canEditTracking = (order) =>
  isGlobalOrder(order) && statusOf(order) === "shipped";

const ShipOrderDialog = ({ open, order, onClose, onSuccess }) => {
  const isUpdate = canEditTracking(order);
  const [platforms, setPlatforms] = useState([]);
  const [platform, setPlatform] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !order) return;
    const s = order.shipping || {};
    const date = s.expectedDeliveryDate
      ? String(s.expectedDeliveryDate).slice(0, 10)
      : "";
    setPlatform(s.platform || "");
    setCourierName(s.courierName || "");
    setTrackingId(s.trackingId || "");
    setTrackingUrl(s.trackingUrl || "");
    setExpectedDate(date);
    setOriginalDate(date);
    setError("");

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/getSmsType");
        const list = data?.setting?.[0]?.shippingPlatforms || [];
        if (!cancelled) setPlatforms(list.filter((p) => p && p.status !== false));
      } catch (e) {
        if (!cancelled) setPlatforms([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, order]);

  if (!order) return null;

  const usingOther = platform === OTHER || (!platform && !platforms.length);
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const handleSubmit = async () => {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please log out and log in again, then retry.");
      return;
    }

    const body = {};
    const chosenPlatform = platform && platform !== OTHER ? platform : "";
    if (chosenPlatform) body.platform = chosenPlatform;
    else if (courierName.trim()) body.courierName = courierName.trim();
    if (trackingId.trim()) body.trackingId = trackingId.trim();
    if (!chosenPlatform && trackingUrl.trim()) {
      body.trackingUrl = trackingUrl.trim();
    }
    if (expectedDate && (!isUpdate || expectedDate !== originalDate)) {
      body.expectedDeliveryDate = expectedDate;
    }

    if (!isUpdate) {
      if (!body.platform && !body.courierName) {
        return setError("Select a shipping platform or enter courier name");
      }
      if (!body.trackingId) return setError("Tracking ID is required");
      if (!body.expectedDeliveryDate) {
        return setError("Expected delivery date is required");
      }
    } else if (!Object.keys(body).length) {
      return setError("Nothing to update");
    }

    setSaving(true);
    try {
      const url = isUpdate
        ? `/order/tracking/${order._id}`
        : `/seller/order/ship/${order._id}`;
      const res = await api.put(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onSuccess) onSuccess(order._id, res.data.order);
      onClose();
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Session expired. Please log out and log in again, then retry.");
      } else {
        setError(err?.response?.data?.message || "Failed to save shipping details");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {isUpdate ? "Edit Tracking" : "Ship Order"} #{order.orderId}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {platforms.length > 0 && (
          <TextField
            select
            fullWidth
            margin="dense"
            label="Shipping Platform"
            value={platform || ""}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {platforms.map((p) => (
              <MenuItem key={p.name} value={p.name}>
                {p.name}
              </MenuItem>
            ))}
            <MenuItem value={OTHER}>Other</MenuItem>
          </TextField>
        )}

        {usingOther && (
          <TextField
            fullWidth
            margin="dense"
            label="Courier Name"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
          />
        )}

        <TextField
          fullWidth
          margin="dense"
          label="Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />

        {usingOther && (
          <TextField
            fullWidth
            margin="dense"
            label="Tracking URL (optional)"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://..."
          />
        )}

        <TextField
          fullWidth
          margin="dense"
          type="date"
          label="Expected Delivery Date"
          value={expectedDate}
          onChange={(e) => setExpectedDate(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: isUpdate ? undefined : today },
          }}
        />

        {platform && platform !== OTHER && (
          <Typography variant="caption" color="text.secondary">
            The tracking link is generated from the platform&apos;s link template.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : isUpdate ? "Update" : "Mark as Shipped"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShipOrderDialog;
