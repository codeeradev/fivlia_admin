import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MDBox from "components/MDBox";
import { showAlert } from "components/commonFunction/alertsLoader";
import { ENDPOINTS } from "api/endPoints";
import { get } from "api/apiClient";
import { put } from "api/apiClient";

const numericFields = new Set([
  "minPrice",
  "maxPrice",
  "minWithdrawal",
  "freeDeliveryLimit",
  "fixDeliveryCharges",
  "perKmCharges",
  "fixNightDeliveryCharges",
  "perKmNightCharges",
  "minimumOrderCancelTime",
  "codLimit",
  "extraTime",
]);

const OrderSetting = ({ miniSidenav }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm")); // <=600px
  const isMd = useMediaQuery(theme.breakpoints.down("md")); // <=900px

  const [formData, setFormData] = useState({
    minPrice: 0,
    maxPrice: 0,
    minWithdrawal: 0,
    freeDeliveryLimit: 0,
    fixDeliveryCharges:0,
    perKmCharges:0,
    fixNightDeliveryCharges: 0,
    perKmNightCharges: 0,
    minimumOrderCancelTime: 0,
    codLimit: 0,
    extraTime:0,
    dayStartTime: "",
    dayEndTime: "",
    nightStartTime: "",
    nightEndTime: "",
    zoneTimeZone: "Asia/Kolkata",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch current settings
  const fetchSettings = async () => {
    setLoading(true);
    showAlert("loading", "Fetching order settings...");
    try {
      const { data } = await get(ENDPOINTS.GET_SMS_TYPE);

      if (data.setting && data.setting[0]) {
        const s = data.setting[0];
        setFormData({
          minPrice: Number(s.minPrice ?? 0),
          maxPrice: Number(s.maxPrice ?? 0),
          minWithdrawal: Number(s.minWithdrawal ?? 0),
          freeDeliveryLimit: Number(s.freeDeliveryLimit ?? 0),
          fixDeliveryCharges: Number(s.fixDeliveryCharges ?? 0),
          perKmCharges: Number(s.perKmCharges ?? 0),
          fixNightDeliveryCharges: Number(s.fixNightDeliveryCharges ?? 0),
          perKmNightCharges: Number(s.perKmNightCharges ?? 0),
          minimumOrderCancelTime: Number(s.minimumOrderCancelTime ?? 0),
          codLimit: Number(s.codLimit ?? 0),
          extraTime: Number(s.extraTime ?? 0),
          dayStartTime: s.dayStartTime || "",
          dayEndTime: s.dayEndTime || "",
          nightStartTime: s.nightStartTime || "",
          nightEndTime: s.nightEndTime || "",
          zoneTimeZone: s.zoneTimeZone || "Asia/Kolkata",
        });
        showAlert("info", "", 1);
      } else {
        showAlert("info", "No settings found, please configure first.");
      }
    } catch (err) {
      console.error("Fetch settings failed:", err);
      showAlert("error", "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
 const handleChange = (e) => {
  const { name, value } = e.target;
  const isNumeric = numericFields.has(name);
  setFormData((prev) => ({
    ...prev,
    [name]: isNumeric ? (value === "" ? 0 : Number(value)) : value,
  }));
};

  const sectionWrapperSx = {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    p: { xs: 2, sm: 2.5 },
    bgcolor: "background.paper",
  };


  // Submit updated settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    showAlert("loading", "Saving settings...");

    try {
      await put(`${ENDPOINTS.ADMIN_SETTING}`, formData);
      showAlert("success", "Settings updated successfully!");
      fetchSettings()
    } catch (err) {
      console.error("Save failed:", err);
      showAlert("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MDBox
      // responsive left margin: 0 on xs, small margin on sm, depends on miniSidenav on md+
      sx={{
        ml: {
          xs: 0,
          sm: 0,
          md: miniSidenav ? "80px" : "250px",
        },
        p: { xs: 1, sm: 2 },
        marginTop: "30px",
      }}
    >
      <Card
        sx={{
          maxWidth: 1100,
          margin: "0 auto",
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          boxShadow: 3,
          transition: "all 0.3s ease",
        }}
      >
        <Typography
          variant={isSm ? "h6" : "h5"}
          fontWeight="bold"
          mb={3}
          sx={{ color: (theme) => theme.palette.text.primary, textAlign: { xs: "center", md: "left" } }}
        >
          Order Settings
        </Typography>

        {loading ? (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="160px"
            sx={{ py: 4 }}
          >
            <CircularProgress color="primary" />
          </MDBox>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={isSm ? 2 : 3}>
              <Grid item xs={12}>
                <MDBox sx={sectionWrapperSx}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Order Value Rules
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Configure order amount thresholds and payout controls.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Minimum Price"
                        name="minPrice"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.minPrice}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Maximum Price"
                        name="maxPrice"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.maxPrice}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Minimum Withdrawal"
                        name="minWithdrawal"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.minWithdrawal}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Free Delivery Limit"
                        name="freeDeliveryLimit"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.freeDeliveryLimit}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="COD Limit"
                        name="codLimit"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.codLimit}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Maximum allowed cash-on-delivery amount"
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <MDBox sx={sectionWrapperSx}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Delivery Charges
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Define day and night delivery pricing model.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Base Delivery Charge"
                        name="fixDeliveryCharges"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.fixDeliveryCharges}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Fix Delivery Charges"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Per K.m Delivery Charge"
                        name="perKmCharges"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.perKmCharges}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Delivery Charges Per Kilo Meter"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Night Base Delivery Charge"
                        name="fixNightDeliveryCharges"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.fixNightDeliveryCharges}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Fixed night charge for first km"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Night Per K.m Delivery Charge"
                        name="perKmNightCharges"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.perKmNightCharges}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Night charge per additional km"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Additional Delivery Time (minutes)"
                        name="extraTime"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.extraTime}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Adds extra minutes to the system-calculated delivery time."
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Order Auto-Cancel Time (Minutes)"
                        name="minimumOrderCancelTime"
                        type="number"
                        inputProps={{ min: 0 }}
                        fullWidth
                        value={formData.minimumOrderCancelTime}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Time (in minutes) after which an unassigned order is auto-cancelled"
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <MDBox sx={sectionWrapperSx}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Day/Night Time Windows
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Define active day and night slots with timezone.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Day Start Time"
                        name="dayStartTime"
                        type="time"
                        fullWidth
                        value={formData.dayStartTime}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        helperText="Day window start time"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Day End Time"
                        name="dayEndTime"
                        type="time"
                        fullWidth
                        value={formData.dayEndTime}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        helperText="Day window end time"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Night Start Time"
                        name="nightStartTime"
                        type="time"
                        fullWidth
                        value={formData.nightStartTime}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        helperText="Night window start time"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Night End Time"
                        name="nightEndTime"
                        type="time"
                        fullWidth
                        value={formData.nightEndTime}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        helperText="Night window end time"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Zone Timezone"
                        name="zoneTimeZone"
                        type="text"
                        fullWidth
                        value={formData.zoneTimeZone}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Asia/Kolkata"
                        helperText="IANA timezone used for day/night radius windows"
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: isSm ? "stretch" : "center", mt: isMd ? 0 : 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={saving}
                  fullWidth={isSm} // full width on small screens
                  sx={{
                    px: { xs: 2, sm: 5 },
                    py: 1.1,
                    borderRadius: 2,
                    fontWeight: 600,
                    color: "#fff",
                    textTransform: "none",
                    maxWidth: isSm ? "100%" : 360,
                    width: isSm ? "100%" : "auto",
                    transition: "all 0.2s ease",
                  }}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Card>
    </MDBox>
  );
};

export default OrderSetting;
