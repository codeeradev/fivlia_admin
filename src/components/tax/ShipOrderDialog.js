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

// Larger inputs so the popup is easy to read and fill
const fieldSx = {
  mt: 2.5,
  "& .MuiInputBase-root": { minHeight: 56, fontSize: 17 },
  "& .MuiInputBase-input": { fontSize: 17, py: 1.75 },
  "& .MuiSelect-select": { fontSize: 17, minHeight: "1.5em !important" },
  "& .MuiInputLabel-root": { fontSize: 16 },
};

const statusOf = (order) =>
  String(order?.orderStatus || "").trim().toLowerCase();

export const isGlobalOrder = (order) => order?.serviceScope === "global";

export const canShipOrder = (order) =>
  isGlobalOrder(order) &&
  [
    "accepted",
    "in processing",
    "inprocessing",
    "processing",
    "ready",
    "ready to pickup",
  ].includes(statusOf(order));

export const canEditTracking = (order) =>
  isGlobalOrder(order) && statusOf(order) === "shipped";

// processingStatus: when set, the popup only asks for the courier and moves the
// order to that status (global order "In Processing"). Tracking id comes later.
const ShipOrderDialog = ({
  open,
  order,
  onClose,
  onSuccess,
  processingStatus = "",
  actorType = "",
}) => {
  const isProcessing = Boolean(processingStatus);
  const isUpdate = !isProcessing && canEditTracking(order);
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
    // courier typed by hand earlier (not in the platform list) -> "Other"
    setPlatform(s.platform || (s.courierName ? OTHER : ""));
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

    // ---- In Processing: courier only, status changes to In Processing
    if (isProcessing) {
      const chosen = platform && platform !== OTHER ? platform : "";
      const typed = courierName.trim();
      if (!chosen && !typed) {
        return setError("Select a shipping platform or enter courier name");
      }
      const pBody = { status: processingStatus };
      if (actorType) pBody.type = actorType;
      if (chosen) pBody.platform = chosen;
      else pBody.courierName = typed;
      setSaving(true);
      try {
        const res = await api.put(`/orderStatus/${order._id}`, pBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const upd = res.data?.update;
        if (onSuccess && upd) {
          onSuccess(order._id, {
            orderStatus: upd.orderStatus,
            shipping: upd.shipping,
          });
        }
        onClose();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to update order");
      } finally {
        setSaving(false);
      }
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
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, minWidth: { sm: 560 } } }}
    >
      <DialogTitle sx={{ fontSize: 24, fontWeight: 700, px: 4, pt: 3, pb: 2 }}>
        {isProcessing ? "Select Courier" : isUpdate ? "Edit Tracking" : "Ship Order"} #{order.orderId}
      </DialogTitle>
      <DialogContent dividers sx={{ px: 4, py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1, fontSize: 15 }}>
            {error}
          </Alert>
        )}

        {platforms.length > 0 && (
          <TextField
            select
            fullWidth
            sx={fieldSx}
            label="Shipping Platform"
            value={platform || ""}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {platforms.map((p) => (
              <MenuItem key={p.name} value={p.name} sx={{ fontSize: 16, py: 1.25 }}>
                {p.name}
              </MenuItem>
            ))}
            <MenuItem value={OTHER} sx={{ fontSize: 16, py: 1.25 }}>
              Other
            </MenuItem>
          </TextField>
        )}

        {usingOther && (
          <TextField
            fullWidth
            sx={fieldSx}
            label="Courier Name"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
          />
        )}

        {!isProcessing && (
        <TextField
          fullWidth
          sx={fieldSx}
          label="Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
        )}

        {usingOther && !isProcessing && (
          <TextField
            fullWidth
            sx={fieldSx}
            label="Tracking URL (optional)"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://..."
          />
        )}

        {!isProcessing && (
        <TextField
          fullWidth
          sx={fieldSx}
          type="date"
          label="Expected Delivery Date"
          value={expectedDate}
          onChange={(e) => setExpectedDate(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: isUpdate ? undefined : today },
          }}
        />
        )}

        {isProcessing && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: 14 }}>
            The tracking ID is added later, when the order is marked as Shipped.
          </Typography>
        )}

        {!isProcessing && platform && platform !== OTHER && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: 14 }}>
            The tracking link is generated from the platform&apos;s link template.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 4, py: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} disabled={saving} size="large" sx={{ fontSize: 15, px: 3 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={saving}
          sx={{ fontSize: 15, px: 4, color: "#fff !important" }}
        >
          {saving
            ? "Saving..."
            : isProcessing
              ? "Save & Move to In Processing"
              : isUpdate
                ? "Update"
                : "Mark as Shipped"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShipOrderDialog;
