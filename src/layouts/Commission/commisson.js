import React, { useState, useEffect, useCallback } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Switch,
  TextField,
  MenuItem,
  Box,
  Typography,
  Collapse,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { showAlert } from "components/commonFunction/alertsLoader";
import { getAllZones, getMainCategories } from "components/commonApi/commonApi";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function SetCommission() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Fetch main categories
  useEffect(() => {
    (async () => {
      try {
        showAlert("loading", "Fetching categories...");
        const res = await getMainCategories();

        setMainCategories(res.data.result || []);
        showAlert("info", "", 1);
      } catch (e) {
        showAlert("error", "Error fetching categories.");
        console.error(e);
      }
    })();
  }, []);

  // Fetch subcategories when a main category is selected
  const fetchSubCategories = async (mainCatId) => {
    try {
      showAlert("loading", "Loading subcategories...");
      const res = await get(`${ENDPOINTS.GET_CATEGORIES}?id=${mainCatId}`);
      const result = res.data;

      const subs = (result.category?.subCategories || []).map((sub) => {
        const subId = sub._id || sub.id || sub.subCategoryId || sub.subcategoryId;
        return {
          _id: subId,
          name: sub.name,
          status: sub.status ?? true,
          commission: Number(sub.commison) || 0,
          subSubCategories: (
            sub.subSubCategories ||
            sub.subsubcategories ||
            sub.subSubCat ||
            []
          ).map((ssc) => {
            const sscId = ssc._id || ssc.id || ssc.subSubCategoryId || ssc.subsubcategoryId;
            console.log("Sub-sub category ID found:", sscId, "from ssc:", ssc);
            return {
              _id: sscId,
              name: ssc.name,
              commission: Number(ssc.commison) || 0,
            };
          }),
        };
      });

      setSubCategories(subs);
      setOpenRows({});
      showAlert("info", "", 1);
    } catch (e) {
      console.error(e);
      showAlert("error", "Failed to load subcategories.");
    }
  };

  // Toggle public/private status
  const handleToggle = useCallback((subId) => {
    setSubCategories((prev) => {
      const updated = prev.map((s) => (s._id === subId ? { ...s, status: !s.status } : s));
      const toggled = updated.find((s) => s._id === subId);

      (async () => {
        try {
          const res = await put(ENDPOINTS.SET_COMMISSION, {
            id: subId,
            commison: toggled.status ? 1 : 0,
            level: "sub",
          });

          if (res && (res.status === 200 || res.status === 201)) {
            // server response body in res.data
            console.log("Status updated successfully:", res.data);
            showAlert("success", "Status updated successfully!");
          } else {
            console.error("Failed to update status, response:", res);
            showAlert("error", "Failed to update status.");
          }
        } catch (e) {
          console.error("Error updating status:", e);
          showAlert("error", "Error updating status.");
        }
      })();

      return updated;
    });
  }, []);

  // Change commission for sub-category
  const handleSubCommissionChange = useCallback((subId, value) => {
    setSubCategories((prev) =>
      prev.map((s) => (s._id === subId ? { ...s, commission: Math.max(0, Number(value) || 0) } : s))
    );
  }, []);

  // Change commission for sub-sub-category
  const handleSSCCommissionChange = useCallback((subId, sscId, value) => {
    setSubCategories((prev) =>
      prev.map((s) =>
        s._id !== subId
          ? s
          : {
              ...s,
              subSubCategories: s.subSubCategories.map((ssc) =>
                ssc._id === sscId ? { ...ssc, commission: Math.max(0, Number(value) || 0) } : ssc
              ),
            }
      )
    );
  }, []);

  // Save commission (sub or sub-sub)
  const saveCommission = async (id, commission, level) => {
    try {
      const res = await put(ENDPOINTS.SET_COMMISSION, {
        id,
        commison: commission,
        level,
      });

      if (res && (res.status === 200 || res.status === 201)) {
        console.log("Commission saved successfully:", res.data);
        showAlert("success", "Commission updated successfully!");
      } else {
        console.error("Failed to save commission, response:", res);
        showAlert("error", "Failed to update commission.");
      }
    } catch (e) {
      console.error("Error saving commission:", e);
      showAlert("error", "Error while saving commission.");
    }
  };

  // Toggle expand/collapse of row
  const toggleRow = useCallback((id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ mt: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Set Commission</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              Set commissions for sub-categories and sub-subcategories
            </p>
          </div>
        </div>

        {/* Main category selector */}
        <Box mb={3} sx={{ width: "100%", maxWidth: 500 }}>
          <TextField
            select
            label="Select Main Category"
            value={selectedMain}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedMain(id);
              fetchSubCategories(id);
            }}
            fullWidth
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: "#fff",
                height: "50px",
                px: 2,
              },
              "& .MuiInputLabel-root": {
                fontSize: 16,
                backgroundColor: "#fff",
                px: 0.5,
              },
              "& .MuiSelect-select": {
                py: 1.5,
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#007bff" },
            }}
          >
            {mainCategories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Subcategories Table */}
        {subCategories.length > 0 && (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            {/* Table Header */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "25% 30% 15% 30%",
                backgroundColor: "#007bff",
                color: "#fff",
                fontWeight: "bold",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Box sx={{ padding: "12px 16px", textAlign: "left" }}>Sub-Category</Box>
              <Box sx={{ padding: "12px 16px", textAlign: "center" }}>Commission</Box>
              <Box sx={{ padding: "12px 16px", textAlign: "center" }}>Public</Box>
              <Box sx={{ padding: "12px 16px", textAlign: "center" }}>Sub-Sub Categories</Box>
            </Box>

            {/* Table Body */}
            {subCategories.map((sub, idx) => (
              <Box
                key={`${sub._id}-${idx}`}
                sx={{
                  borderBottom: "1px solid #e0e0e0",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "25% 30% 15% 30%",
                  }}
                >
                  {/* Sub-category name */}
                  <Box sx={{ padding: "12px 16px", textAlign: "left", verticalAlign: "top" }}>
                    <Typography variant="body2" fontWeight="medium">
                      {sub.name}
                    </Typography>
                  </Box>

                  {/* Commission input */}
                  <Box sx={{ padding: "12px 16px", textAlign: "center", verticalAlign: "top" }}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                      sx={{ maxWidth: "200px", margin: "0 auto" }}
                    >
                      <TextField
                        type="number"
                        value={sub.commission}
                        onChange={(e) => handleSubCommissionChange(sub._id, e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                        InputProps={{
                          inputProps: { min: 0, max: 100 },
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          height: 36,
                          color: "white !important",
                          backgroundColor: "#007bff",
                          "&:hover": { backgroundColor: "#0056b3" },
                          minWidth: "60px",
                        }}
                        onClick={() => {
                          saveCommission(sub._id, sub.commission, "sub");
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>

                  {/* Public toggle */}
                  <Box sx={{ padding: "12px 16px", textAlign: "center", verticalAlign: "top" }}>
                    <Switch
                      checked={!!sub.status}
                      onChange={() => handleToggle(sub._id)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "green" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "green !important",
                        },
                        "& .MuiSwitch-track": { backgroundColor: "red", opacity: 1 },
                      }}
                    />
                  </Box>

                  {/* Sub-sub categories toggle */}
                  <Box sx={{ padding: "12px 16px", textAlign: "center", verticalAlign: "top" }}>
                    {sub.subSubCategories?.length > 0 ? (
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          textTransform: "none",
                          borderColor: "#007bff",
                          color: "#007bff",
                          fontSize: 14,
                        }}
                        onClick={() => toggleRow(sub._id)}
                      >
                        {openRows[sub._id] ? "Hide" : "Show"} ({sub.subSubCategories.length})
                      </Button>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No sub-sub categories
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Sub-sub categories grid */}
                {sub.subSubCategories?.length > 0 && (
                  <Collapse in={!!openRows[sub._id]} timeout="auto" unmountOnExit>
                    <Box sx={{ backgroundColor: "#f6f9fc", padding: "12px" }}>
                      {/* Sub-sub categories header */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "0% 50% 25% 25%",
                          backgroundColor: "transparent",
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "13px",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        <Box sx={{ padding: "8px 16px" }}></Box>
                        <Box sx={{ padding: "8px 16px", textAlign: "left" }}>Sub-Sub Category</Box>
                        <Box sx={{ padding: "8px 16px", textAlign: "center" }}>Commission</Box>
                        <Box sx={{ padding: "8px 16px", textAlign: "center" }}>Action</Box>
                      </Box>

                      {/* Sub-sub categories body */}
                      {sub.subSubCategories.map((ssc, sIdx) => (
                        <Box
                          key={`${ssc._id}-${sIdx}`}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "0% 50% 25% 25%",
                            borderBottom: "1px solid #dee2e6",
                            "&:hover": { backgroundColor: "#f1f1f1" },
                          }}
                        >
                          <Box sx={{ padding: "8px 16px" }}></Box>
                          <Box
                            sx={{ padding: "8px 16px", textAlign: "left", verticalAlign: "top" }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "500", color: "#333", fontSize: "13px" }}
                            >
                              {ssc.name}
                            </Typography>
                          </Box>
                          <Box
                            sx={{ padding: "8px 16px", textAlign: "center", verticalAlign: "top" }}
                          >
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              gap={1}
                              sx={{ maxWidth: "200px", margin: "0 auto" }}
                            >
                              <TextField
                                type="number"
                                size="small"
                                value={ssc.commission}
                                onChange={(e) =>
                                  handleSSCCommissionChange(sub._id, ssc._id, e.target.value)
                                }
                                sx={{
                                  width: 90,
                                  "& .MuiOutlinedInput-root": {
                                    height: "28px",
                                    fontSize: "12px",
                                  },
                                }}
                                InputProps={{
                                  inputProps: { min: 0, max: 100 },
                                  endAdornment: (
                                    <InputAdornment position="end" sx={{ fontSize: "11px" }}>
                                      %
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </Box>
                          <Box
                            sx={{ padding: "8px 16px", textAlign: "center", verticalAlign: "top" }}
                          >
                            <Button
                              size="small"
                              variant="contained"
                              sx={{
                                height: 28,
                                color: "white !important",
                                backgroundColor: "#28a745",
                                "&:hover": { backgroundColor: "#218838" },
                                fontSize: "11px",
                                textTransform: "none",
                                fontWeight: "500",
                                minWidth: "50px",
                              }}
                              onClick={() => {
                                console.log("Sub-sub category data:", ssc);
                                console.log("Sub-sub category ID:", ssc._id);
                                console.log("Sub-sub category commission:", ssc.commission);
                                saveCommission(ssc._id, ssc.commission, "subsub");
                              }}
                            >
                              Save
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                )}
              </Box>
            ))}
          </Paper>
        )}
      </div>
    </MDBox>
  );
}
