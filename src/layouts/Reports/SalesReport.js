import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  TextField,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "react-data-table-component";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";
import { getAllZones, getMainCategories } from "components/commonApi/commonApi";

export default function SalesReport() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(100);

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [zones, setZones] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    driverPaid: 0,
    sellerPaid: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    getCategories();
    getCities();
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      showAlert("loading", "Fetching report...");

      const response = await get(ENDPOINTS.GET_SELLER_REPORT, {
        params: {
          categoryId: selectedCategory?._id || "",
          city: selectedCity?._id || "",
          zone: selectedZone?._id || "",
          sellerId: selectedSeller?.sellerId || "",
          fromDate: fromDate ? `${fromDate}T00:00:00.000Z` : "",
          toDate: toDate ? `${toDate}T23:59:59.999Z` : "",
        },
      });

      setReports(response.data.data || []);
      const uniqueSellers = Array.from(
        new Map((response.data.data || []).map((r) => [r.sellerName, r])).values()
      );
      setSellers(uniqueSellers);

      setSummary({
        totalRevenue: response.data.totalRevenue || 0,
        driverPaid: response.data.driverPaid || 0,
        sellerPaid: response.data.sellerPaid || 0,
        totalProfit: response.data.totalProfit || 0,
      });

      showAlert("success", "Report loaded");
    } catch (err) {
      console.error("Error fetching report:", err);
      showAlert("error", "Failed to load report");
    }
  };

  const getCategories = async () => {
    try {
      const res = await getMainCategories();
      setCategories(res.data.result || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      showAlert("error", "Failed to load categories");
    }
  };

  const getCities = async () => {
    try {
      const res = await getAllZones();
      setCityData(res.data || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
      showAlert("error", "Failed to load cities");
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedZone(null);
    setZones(city?.zones || []);
  };

  const handleOpenDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedOrder(null);
    setDetailsModalOpen(false);
  };

  const columns = [
    {
      name: "Order ID",
      selector: (row) => row.orderId,
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <Tooltip title="View Order Details" arrow>
          <Typography
            sx={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "primary.main",
              fontWeight: 500,
            }}
            onClick={() => handleOpenDetailsModal(row)}
          >
            {row.orderId}
          </Typography>
        </Tooltip>
      ),
    },
    { name: "Seller Name", selector: (row) => row.sellerName, sortable: true, minWidth: "150px" },
    { name: "City", selector: (row) => row.city || "-", sortable: true, minWidth: "120px" },
    { name: "Zone", selector: (row) => row.zone || "-", sortable: true, minWidth: "140px" },
    {
      name: "Order At",
      selector: (row) => (row.createdAt ? moment(row.createdAt).format("DD MMM YYYY") : "-"),
      minWidth: "130px",
    },
    {
      name: "GST",
      selector: (row) => row.tax?.toFixed(2) ?? "-",
      minWidth: "80px",
    },
    {
      name: "Delivery Charge",
      selector: (row) => row.deliveryCharge?.toFixed(2) ?? "-",
      minWidth: "150px",
    },
    {
      name: "Amount",
      selector: (row) => row.totalPrice?.toFixed(2),
      minWidth: "100px",
    },
    {
      name: "Platform Fee",
      selector: (row) => row.platformFeeAmount?.toFixed(2) ?? "-",
      minWidth: "120px",
    },
    {
      name: "Commission",
      selector: (row) => row.commission?.toFixed(2) ?? "-",
      minWidth: "120px",
    },
    {
      name: "Profit",
      selector: (row) => row.profit?.toFixed(2) ?? "-",
      minWidth: "80px",
    },
  ];

  const getExportData = () =>
    reports.map((row) => ({
      "Order ID": row.orderId,
      "Seller Name": row.sellerName,
      City: row.city || "-",
      Zone: Array.isArray(row.zone) ? row.zone.join(", ") : row.zone || "-",
      "Order Date": row.createdAt ? moment(row.createdAt).format("DD MMM YYYY") : "-",
      GST: (row.tax).toFixed(2),
      "Delivery Charge": row.deliveryCharge,
      Amount: Number(row.totalPrice || 0).toFixed(2),
      "Platform Fee": Number(row.platformFeeAmount || 0).toFixed(2),
      Commission: Number(row.commission || 0).toFixed(2),
      Profit: (row.profit).toFixed(2),
    }));

  const handleExcelDownload = () => {
    if (!reports.length) return;

    const worksheet = XLSX.utils.json_to_sheet(getExportData());
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `Sales_Report_${fromDate || "ALL"}_to_${toDate || "ALL"}.xlsx`);
  };

  const handlePdfDownload = () => {
    if (!reports.length) return;

    const doc = new jsPDF("landscape");

    doc.setFontSize(14);
    doc.text("Sales Report", 14, 12);

    doc.setFontSize(10);
    doc.text(
      `Revenue: Rs. ${summary.totalRevenue.toFixed(
        2
      )}   |   Profit: Rs. ${summary.totalProfit.toFixed(2)}`,
      14,
      20
    );

    autoTable(doc, {
      startY: 26,
      head: [Object.keys(getExportData()[0])],
      body: getExportData().map((row) => Object.values(row)),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`Sales_Report_${fromDate || "ALL"}_to_${toDate || "ALL"}.pdf`);
  };

  return (
    <MDBox
      sx={{
        ml: { xs: 0, sm: miniSidenav ? "80px" : "250px" },
        mt: "30px",
        p: { xs: 1, sm: 2 },
      }}
    >
      {/* Summary Boxes */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Revenue
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            ₹{summary.totalRevenue.toFixed(2)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Paid To Driver
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            ₹{summary.driverPaid.toFixed(2)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Paid To Seller
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            ₹{summary.sellerPaid.toFixed(2)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Profit
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            ₹{summary.totalProfit.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      <Paper
        elevation={2}
        sx={{
          width: "100%",
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          backgroundColor: "#fff",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Sales Report
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Filter by Category, City, and Zone to refine report results.
          </Typography>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2.5,
            mb: 3,
          }}
        >
          {/* Category */}
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={categories}
            value={selectedCategory}
            getOptionLabel={(option) => option?.name || ""}
            onChange={(e, val) => setSelectedCategory(val)}
            renderInput={(params) => (
              <TextField {...params} label="Category" size="small" variant="outlined" />
            )}
          />

          {/* City */}
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={cityData}
            value={selectedCity}
            getOptionLabel={(option) => option?.city || ""}
            onChange={(e, val) => handleCityChange(val)}
            renderInput={(params) => (
              <TextField {...params} label="City" size="small" variant="outlined" />
            )}
          />

          {/* Zone */}
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={zones}
            value={selectedZone}
            getOptionLabel={(option) => option?.zoneTitle || ""}
            onChange={(e, val) => setSelectedZone(val)}
            disabled={!zones.length}
            renderInput={(params) => (
              <TextField {...params} label="Zone" size="small" variant="outlined" />
            )}
          />
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={sellers}
            value={selectedSeller}
            getOptionLabel={(option) => option?.sellerName || ""}
            onChange={(e, val) => setSelectedSeller(val)}
            renderInput={(params) => <TextField {...params} label="Seller" size="small" />}
          />

          {/* From Date */}
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />

          {/* To Date */}
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />

          <Button
            variant="contained"
            onClick={fetchReport}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff !important",
              borderRadius: "8px",
              px: 3,
              py: 1.4,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1565c0" },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Apply Filters"}
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            mt: 1,
            px: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing <b>{reports.length}</b> records
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleExcelDownload}
              disabled={!reports.length}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2.5,
              }}
            >
              Export Excel
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handlePdfDownload}
              disabled={!reports.length}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2.5,
              }}
            >
              Export PDF
            </Button>
          </Box>
        </Box>

        {/* Data Table */}
        <Box sx={{ overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={reports}
            progressPending={loading}
            pagination
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[100, 200, 300, 500, 1000]}
            onChangeRowsPerPage={(newPerPage) => setPerPage(newPerPage)}
            highlightOnHover
            pointerOnHover
            dense
            customStyles={{
              headCells: {
                style: {
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  fontSize: "14px",
                },
              },
              cells: { style: { fontSize: "13px" } },
              pagination: {
                style: {
                  fontSize: "14px",
                  minHeight: "56px",
                  backgroundColor: "#fafafa",
                },
              },
            }}
            noDataComponent="No sales reports found"
          />
        </Box>
      </Paper>

      {/* Order Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          },
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 1,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Order Details
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Order ID: {selectedOrder.orderId}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDetailsModal}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1, pb: 3 }}>
              {selectedOrder.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 80px 120px",
                    alignItems: "center",
                    py: 1.5,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Box textAlign="center">
                    <Avatar
                      src={`${process.env.REACT_APP_IMAGE_LINK}${item.image}`}
                      alt={item.productName}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mx: "auto", border: "1px solid #ddd" }}
                    />
                  </Box>
                  <Box>{item.productName}</Box>
                  <Box textAlign="center">{item.quantity}</Box>
                  <Box textAlign="right">₹{item.price.toFixed(2)}</Box>
                </Box>
              ))}

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    backgroundColor: "#f1f8e9",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  Total: ₹{selectedOrder.totalPrice?.toFixed(2)}
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </MDBox>
  );
}
