import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { showAlert } from "components/commonFunction/alertsLoader";
import { ENDPOINTS } from "api/endPoints";
import { get, put } from "api/apiClient";

const emptyRule = () => ({
  pincode: "",
  shippingCharge: "",
  daysMin: "",
  daysMax: "",
  codAllowed: false,
});

const emptyDefaults = () => ({
  shippingCharge: "",
  daysMin: "",
  daysMax: "",
  codAllowed: false,
});

export default function GlobalOrderSetting({ miniSidenav }) {
  const [formData, setFormData] = useState({
    globalDeliveryRules: [],
    globalDeliveryDefaults: null,
    shippingPlatforms: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [codFilter, setCodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyRule());
  const pageSize = 10;
  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await get(ENDPOINTS.GET_SMS_TYPE);
      const settings = data.setting?.[0] || {};
      setFormData({
        globalDeliveryRules: settings.globalDeliveryRules || [],
        globalDeliveryDefaults: settings.globalDeliveryDefaults
          ? {
              ...settings.globalDeliveryDefaults,
              shippingCharge: String(settings.globalDeliveryDefaults.shippingCharge ?? ""),
              daysMin: String(settings.globalDeliveryDefaults.daysMin ?? ""),
              daysMax: String(settings.globalDeliveryDefaults.daysMax ?? ""),
            }
          : null,
        shippingPlatforms: settings.shippingPlatforms || [],
      });
    } catch (err) {
      setError("Failed to load global order settings. Please retry.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSettings();
  }, []);
  const filteredRules = formData.globalDeliveryRules
    .map((rule, index) => ({ rule, index }))
    .filter(({ rule }) => String(rule.pincode || "").includes(search.trim()))
    .filter(
      ({ rule }) =>
        codFilter === "all" || rule.codAllowed === (codFilter === "enabled")
    );
  const pageCount = Math.max(1, Math.ceil(filteredRules.length / pageSize));
  const visibleRules = filteredRules.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const openAddDialog = () => {
    setEditIndex(null);
    setEditDraft(emptyRule());
    setDialogOpen(true);
  };
  const openEditDialog = (index) => {
    setEditIndex(index);
    setEditDraft({ ...formData.globalDeliveryRules[index] });
    setDialogOpen(true);
  };
  const saveRuleDraft = async () => {
    const pin = String(editDraft.pincode || "").trim();
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      showAlert("error", "Enter a valid six-digit PIN code.");
      return;
    }
    if (
      formData.globalDeliveryRules.some(
        (rule, index) =>
          index !== editIndex && String(rule.pincode).trim() === pin
      )
    ) {
      showAlert("error", `PIN code ${pin} already exists.`);
      return;
    }
    if (
      [editDraft.shippingCharge, editDraft.daysMin, editDraft.daysMax].some(
        (value) =>
          String(value).trim() === "" ||
          !Number.isFinite(Number(value)) ||
          Number(value) < 0
      ) ||
      !Number.isInteger(Number(editDraft.daysMin)) ||
      !Number.isInteger(Number(editDraft.daysMax)) ||
      Number(editDraft.daysMax) < Number(editDraft.daysMin)
    ) {
      showAlert(
        "error",
        "Enter a non-negative charge and whole delivery days, with maximum days at least minimum days."
      );
      return;
    }
    const rule = {
      ...editDraft,
      pincode: pin,
      shippingCharge: Number(editDraft.shippingCharge),
      daysMin: Number(editDraft.daysMin),
      daysMax: Number(editDraft.daysMax),
      codAllowed: editDraft.codAllowed === true,
    };
    const nextRules =
      editIndex === null
        ? [...formData.globalDeliveryRules, rule]
        : formData.globalDeliveryRules.map((item, index) =>
            index === editIndex ? rule : item
          );
    setSavingRule(true);
    try {
      await put(ENDPOINTS.ADMIN_SETTING, { globalDeliveryRules: nextRules });
      setFormData((prev) => ({ ...prev, globalDeliveryRules: nextRules }));
      setSearch("");
      setCodFilter("all");
      if (editIndex === null) setPage(Math.ceil(nextRules.length / pageSize));
      setDialogOpen(false);
      showAlert("success", `PIN code ${pin} saved successfully.`);
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || `Could not save PIN code ${pin}.`
      );
    } finally {
      setSavingRule(false);
    }
  };
  const removeRuleDraft = async () => {
    const nextRules = formData.globalDeliveryRules.filter(
      (_, index) => index !== editIndex
    );
    setSavingRule(true);
    try {
      await put(ENDPOINTS.ADMIN_SETTING, { globalDeliveryRules: nextRules });
      setFormData((prev) => ({ ...prev, globalDeliveryRules: nextRules }));
      setPage((current) =>
        Math.min(current, Math.max(1, Math.ceil(nextRules.length / pageSize)))
      );
      setDialogOpen(false);
      showAlert("success", "PIN code removed successfully.");
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Could not remove this PIN code."
      );
    } finally {
      setSavingRule(false);
    }
  };
  // Shipping platforms (third party couriers for global orders)
  const updatePlatform = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      shippingPlatforms: prev.shippingPlatforms.map((p, i) =>
        i === index ? { ...p, [key]: value } : p
      ),
    }));
  };

  const addPlatform = () => {
    setFormData((prev) => ({
      ...prev,
      shippingPlatforms: [
        ...prev.shippingPlatforms,
        { name: "", trackingUrlTemplate: "", status: true },
      ],
    }));
  };

  const removePlatform = (index) => {
    setFormData((prev) => ({
      ...prev,
      shippingPlatforms: prev.shippingPlatforms.filter((_, i) => i !== index),
    }));
  };

  const sectionWrapperSx = {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    p: 2,
  };
  const updateGlobalDefaults = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      globalDeliveryDefaults: {
        ...(prev.globalDeliveryDefaults || emptyDefaults()),
        [key]: value,
      },
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const pincodes = new Set();
    for (const rule of formData.globalDeliveryRules) {
      const pin = String(rule.pincode).trim();
      if (!/^[1-9][0-9]{5}$/.test(pin) || pincodes.has(pin)) {
        showAlert(
          "error",
          "Each delivery rule needs a unique, valid six-digit PIN code."
        );
        return;
      }
      pincodes.add(pin);
      if (
        [rule.shippingCharge, rule.daysMin, rule.daysMax].some(
          (v) =>
            String(v).trim() === "" ||
            !Number.isFinite(Number(v)) ||
            Number(v) < 0
        ) ||
        !Number.isInteger(Number(rule.daysMin)) ||
        !Number.isInteger(Number(rule.daysMax)) ||
        Number(rule.daysMax) < Number(rule.daysMin)
      ) {
        showAlert(
          "error",
          "Enter a non-negative charge and whole delivery days, with maximum days at least minimum days."
        );
        return;
      }
    }
    if (formData.globalDeliveryDefaults) {
      const defaults = formData.globalDeliveryDefaults;
      if (
        [defaults.shippingCharge, defaults.daysMin, defaults.daysMax].some(
          (value) =>
            String(value).trim() === "" ||
            !Number.isFinite(Number(value)) ||
            Number(value) < 0
        ) ||
        !Number.isInteger(Number(defaults.daysMin)) ||
        !Number.isInteger(Number(defaults.daysMax)) ||
        Number(defaults.daysMax) < Number(defaults.daysMin)
      ) {
        showAlert(
          "error",
          "Enter a non-negative default charge and whole delivery days, with maximum days at least minimum days."
        );
        return;
      }
    }
    const seen = new Set();
    for (const p of formData.shippingPlatforms) {
      const name = String(p.name || "").trim();
      const tpl = String(p.trackingUrlTemplate || "").trim();
      if (!name) {
        showAlert("error", "Each shipping platform needs a name");
        return;
      }
      if (seen.has(name.toLowerCase())) {
        showAlert("error", `Duplicate shipping platform: ${name}`);
        return;
      }
      seen.add(name.toLowerCase());
      if (tpl && !tpl.includes("{trackingId}")) {
        showAlert(
          "error",
          `Tracking link of ${name} must contain {trackingId}`
        );
        return;
      }
    }

    setSaving(true);
    try {
      await put(ENDPOINTS.ADMIN_SETTING, {
        globalDeliveryDefaults: formData.globalDeliveryDefaults
          ? {
              shippingCharge: Number(formData.globalDeliveryDefaults.shippingCharge),
              daysMin: Number(formData.globalDeliveryDefaults.daysMin),
              daysMax: Number(formData.globalDeliveryDefaults.daysMax),
              codAllowed: formData.globalDeliveryDefaults.codAllowed === true,
            }
          : null,
        globalDeliveryRules: formData.globalDeliveryRules.map((r) => ({
          pincode: String(r.pincode).trim(),
          shippingCharge: Number(r.shippingCharge),
          daysMin: Number(r.daysMin),
          daysMax: Number(r.daysMax),
          codAllowed: r.codAllowed === true,
        })),
        shippingPlatforms: formData.shippingPlatforms.map((p) => ({
          name: p.name.trim(),
          trackingUrlTemplate: (p.trackingUrlTemplate || "").trim(),
          status: p.status !== false,
        })),
      });
      showAlert("success", "Global order settings saved.");
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to save global order settings."
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <MDBox
      sx={{
        ml: { xs: 0, md: miniSidenav ? "80px" : "250px" },
        p: { xs: 1, sm: 2 },
        mt: "30px",
      }}
    >
      <Card
        sx={{
          maxWidth: 1100,
          m: "0 auto",
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" mb={3}>
          Global Order Settings
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert
            severity="error"
            action={
              <MDButton color="info" variant="text" onClick={fetchSettings}>
                Retry
              </MDButton>
            }
          >
            {error}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <fieldset
              disabled={saving}
              style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <MDBox sx={sectionWrapperSx}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Global (All India) Delivery
                    </Typography>
                    <Typography variant="body2" mb={2}>
                      Set delivery charges, days and cash on delivery for each
                      PIN code. These exact-PIN values take priority over the
                      default values below.
                    </Typography>
                    <MDBox
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(formData.globalDeliveryDefaults)}
                            onChange={(event) =>
                              setFormData((prev) => ({
                                ...prev,
                                globalDeliveryDefaults: event.target.checked
                                  ? emptyDefaults()
                                  : null,
                              }))
                            }
                          />
                        }
                        label="Use default values when a PIN code has no exact rule"
                      />
                      {formData.globalDeliveryDefaults && (
                        <>
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            These values enable global delivery for otherwise
                            unlisted valid PIN codes. Exact-PIN settings still override them.
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Default Delivery Charge (₹)"
                                required
                                type="number"
                                inputProps={{ min: 0, step: "0.01" }}
                                fullWidth
                                value={formData.globalDeliveryDefaults.shippingCharge}
                                onChange={(event) => updateGlobalDefaults("shippingCharge", event.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Default Minimum Delivery Days"
                                required
                                type="number"
                                inputProps={{ min: 0, step: 1 }}
                                fullWidth
                                value={formData.globalDeliveryDefaults.daysMin}
                                onChange={(event) => updateGlobalDefaults("daysMin", event.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Default Maximum Delivery Days"
                                required
                                type="number"
                                inputProps={{ min: 0, step: 1 }}
                                fullWidth
                                value={formData.globalDeliveryDefaults.daysMax}
                                onChange={(event) => updateGlobalDefaults("daysMax", event.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControlLabel
                                label="Allow Cash on Delivery by default"
                                control={
                                  <Switch
                                    checked={formData.globalDeliveryDefaults.codAllowed === true}
                                    onChange={(event) => updateGlobalDefaults("codAllowed", event.target.checked)}
                                  />
                                }
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </MDBox>
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Search PIN code"
                          value={search}
                          onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                          }}
                          fullWidth
                          size="small"
                          sx={{ height: 40 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small" sx={{ height: 40 }}>
                          <Select
                            size="small"
                            sx={{
                              height: 40,
                              "& .MuiSelect-select": {
                                minHeight: "40px !important",
                                boxSizing: "border-box",
                                display: "flex",
                                alignItems: "center",
                                py: 0,
                              },
                            }}
                            displayEmpty
                            inputProps={{
                              "aria-label": "Filter by COD availability",
                            }}
                            renderValue={(value) =>
                              ({
                                all: "COD: All",
                                enabled: "COD: Enabled",
                                disabled: "COD: Disabled",
                              }[value])
                            }
                            value={codFilter}
                            onChange={(event) => {
                              setCodFilter(event.target.value);
                              setPage(1);
                            }}
                          >
                            <MenuItem value="all">All COD settings</MenuItem>
                            <MenuItem value="enabled">COD enabled</MenuItem>
                            <MenuItem value="disabled">COD disabled</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MDButton
                          color="info"
                          variant="outlined"
                          onClick={openAddDialog}
                          fullWidth
                          sx={{ height: 40 }}
                        >
                          + Add PIN Code
                        </MDButton>
                      </Grid>
                    </Grid>
                    {visibleRules.length ? (
                      <>
                        <TableContainer
                          sx={{
                            width: "100%",
                            overflowX: "auto",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Table
                            size="small"
                            sx={{ width: "100%", minWidth: 640, tableLayout: "fixed" }}
                          >
                            <TableHead sx={{ display: "table-header-group", padding: 0 }}>
                              <TableRow>
                                <TableCell>
                                  <strong>PIN Code</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Delivery Charge</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Delivery Days</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>COD</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>Action</strong>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {visibleRules.map(({ rule, index }) => (
                                <TableRow
                                  key={`${rule.pincode}-${index}`}
                                  hover
                                >
                                  <TableCell>{rule.pincode}</TableCell>
                                  <TableCell>
                                    ₹{Number(rule.shippingCharge).toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    {rule.daysMin === rule.daysMax
                                      ? `${rule.daysMin} days`
                                      : `${rule.daysMin}–${rule.daysMax} days`}
                                  </TableCell>
                                  <TableCell>
                                    {rule.codAllowed ? "Enabled" : "Disabled"}
                                  </TableCell>
                                  <TableCell align="right">
                                    <MDButton
                                      color="info"
                                      variant="text"
                                      onClick={() => openEditDialog(index)}
                                    >
                                      Edit
                                    </MDButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Grid
                          container
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mt: 1.5 }}
                        >
                          <Grid item>
                            <Typography variant="body2" color="text.secondary">
                              Showing{" "}
                              {filteredRules.length
                                ? (page - 1) * pageSize + 1
                                : 0}
                              –{Math.min(page * pageSize, filteredRules.length)}{" "}
                              of {filteredRules.length} PIN codes
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Pagination
                              count={pageCount}
                              page={page}
                              onChange={(_, value) => setPage(value)}
                              color="primary"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        {formData.globalDeliveryRules.length
                          ? "No PIN codes match your search or filter."
                          : "Add a PIN code to enable global delivery for that area."}
                      </Alert>
                    )}
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                  <MDBox sx={sectionWrapperSx}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Shipping Platforms (Global Orders)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Third party couriers used to ship global orders. The
                      tracking link must contain {"{trackingId}"}, e.g.
                      https://www.delhivery.com/track/package/{"{trackingId}"}
                    </Typography>
                    {formData.shippingPlatforms.map((p, index) => (
                      <Grid
                        container
                        spacing={2}
                        key={index}
                        alignItems="center"
                        mb={1}
                      >
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Platform Name"
                            fullWidth
                            value={p.name}
                            onChange={(e) =>
                              updatePlatform(index, "name", e.target.value)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <TextField
                            label="Tracking Link Template"
                            fullWidth
                            value={p.trackingUrlTemplate}
                            onChange={(e) =>
                              updatePlatform(
                                index,
                                "trackingUrlTemplate",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            placeholder="https://courier.com/track/{trackingId}"
                          />
                        </Grid>
                        <Grid item xs={6} sm={1.5}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={p.status !== false}
                                onChange={(e) =>
                                  updatePlatform(
                                    index,
                                    "status",
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label="Active"
                          />
                        </Grid>
                        <Grid item xs={6} sm={1.5}>
                          <MDButton
                            color="error"
                            variant="text"
                            onClick={() => removePlatform(index)}
                            sx={{
                              color: "#d32f2f !important",
                              fontWeight: 700,
                            }}
                          >
                            Remove
                          </MDButton>
                        </Grid>
                      </Grid>
                    ))}
                    <MDButton
                      color="info"
                      variant="outlined"
                      onClick={addPlatform}
                      sx={{
                        color: "#1A73E8 !important",
                        borderColor: "#1A73E8",
                        fontWeight: 700,
                      }}
                    >
                      + Add Platform
                    </MDButton>
                  </MDBox>
                </Grid>

                <Dialog
                  open={dialogOpen}
                  onClose={() => !savingRule && setDialogOpen(false)}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>
                    {editIndex === null ? "Add PIN Code" : "Edit PIN Code"}
                  </DialogTitle>
                  <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="PIN Code"
                          required
                          fullWidth
                          value={editDraft.pincode}
                          inputProps={{ maxLength: 6, inputMode: "numeric" }}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              pincode: event.target.value,
                            }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Delivery Charge (₹)"
                          required
                          type="number"
                          inputProps={{ min: 0, step: "0.01" }}
                          fullWidth
                          value={editDraft.shippingCharge}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              shippingCharge: event.target.value,
                            }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Delivery Days (Min)"
                          required
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                          fullWidth
                          value={editDraft.daysMin}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              daysMin: event.target.value,
                            }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Delivery Days (Max)"
                          required
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                          fullWidth
                          value={editDraft.daysMax}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              daysMax: event.target.value,
                            }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          label="Allow Cash on Delivery for Global Orders"
                          control={
                            <Switch
                              checked={editDraft.codAllowed === true}
                              onChange={(event) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  codAllowed: event.target.checked,
                                }))
                              }
                            />
                          }
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions
                    sx={{ justifyContent: "space-between", px: 3, pb: 2 }}
                  >
                    {editIndex !== null ? (
                      <MDButton
                        color="error"
                        variant="text"
                        disabled={savingRule}
                        onClick={removeRuleDraft}
                      >
                        Remove
                      </MDButton>
                    ) : (
                      <span />
                    )}
                    <span>
                      <MDButton
                        color="secondary"
                        variant="text"
                        disabled={savingRule}
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </MDButton>
                      <MDButton
                        color="info"
                        variant="contained"
                        disabled={savingRule}
                        onClick={saveRuleDraft}
                        sx={{ ml: 1 }}
                      >
                        {savingRule ? "Saving..." : "Save PIN Code"}
                      </MDButton>
                    </span>
                  </DialogActions>
                </Dialog>
                <Grid item xs={12}>
                  <MDButton
                    color="info"
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ color: "#fff" }}
                  >
                    {saving ? "Saving..." : "Save Global Order Settings"}
                  </MDButton>
                </Grid>
              </Grid>
            </fieldset>
          </form>
        )}
      </Card>
    </MDBox>
  );
}
