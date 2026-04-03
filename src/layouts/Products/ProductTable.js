import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  Switch,
  Chip,
  Tooltip,
  Popover,
  Typography,
  Modal,
  Box,
} from "@mui/material";

import { get, del, post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

import InfoIcon from "@mui/icons-material/Info";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ImagePicker from "components/products/imagePicker";
import ImageUploadPanel from "components/products/imageUpload";
import { showAlert } from "components/commonFunction/alertsLoader";
import TaxHeader from "components/tax/fetchTax";

// Styles for table headers and cells
const headerCell = {
  padding: "14px 12px",
  border: "1px solid #ddd",
  fontSize: 18,
  fontWeight: "bold",
  backgroundColor: "#007bff",
  color: "white",
  textAlign: "left",
};

const bodyCell = {
  padding: "12px",
  border: "1px solid #eee",
  fontSize: 16,
  backgroundColor: "#fff",
};

function ProductTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState(250); // Default to 10 for API pagination
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [publicStatus, setPublicStatus] = useState({});
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [popoverData, setPopoverData] = useState([]);
  const [popoverIndex, setPopoverIndex] = useState(null);
  const [popoverType, setPopoverType] = useState("");
  const [uploadPreview, setUploadPreview] = useState(null);
  const [imageUploadPreview, setImageUploadPreview] = useState(null);
  const [taxInfo, setTaxInfo] = useState({
    header: "Tax",
    values: [],
    defaultValue: "",
  });

  const [openImagePreviewModal, setOpenImagePreviewModal] = useState(false);
  const [openFormatModal, setOpenFormatModal] = useState(false);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [openCsvPreviewModal, setOpenCsvPreviewModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [bulkUploadedImages, setBulkUploadedImages] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, entries, selectedCity, selectedCategory, currentPage]);

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const handleDeleteProduct = async (id) => {
    handleMenuClose();
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const result = await del(`${ENDPOINTS.DELETE_PRODUCT}/${id}`);

      if (result.status === 200) {
        showAlert("success", "Product deleted successfully");
        // Refetch products with current page and limit
        fetchProducts();
      } else {
        showAlert("error", "Failed to delete product");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // Filter products client-side
  const filteredProducts = React.useMemo(() => {
    return Array.isArray(data)
      ? data
          .filter((item) =>
            selectedCity ? item.location?.some((loc) => loc.city?.[0]?.name === selectedCity) : true
          )
          .filter((item) =>
            selectedCategory ? item.category?.some((cat) => cat.name === selectedCategory) : true
          )
          .filter((item) =>
            Object.values(item).some((val) =>
              Array.isArray(val)
                ? val.some((v) =>
                    typeof v === "object"
                      ? Object.values(v).some((subVal) =>
                          String(subVal).toLowerCase().includes(search.toLowerCase())
                        )
                      : String(v).toLowerCase().includes(search.toLowerCase())
                  )
                : String(val).toLowerCase().includes(search.toLowerCase())
            )
          )
      : [];
  }, [data, selectedCity, selectedCategory, search]);

  const fetchProducts = async () => {
    try {
      const query = `?page=${currentPage}&limit=${entries}&search=${encodeURIComponent(
        searchQuery
      )}&city=${encodeURIComponent(selectedCity)}&category=${encodeURIComponent(selectedCategory)}`;

      const resp = await get(`${ENDPOINTS.GET_PRODUCTS}${query}`);
      const res = resp.data;

      setData(res.Product || []);
      setTotalItems(res.count || 0);
      setTotalPages(res.totalPages || 1);

      const initialPublicStatus = (res.Product || []).reduce((acc, cur) => {
        acc[cur._id] = cur.status === true;
        return acc;
      }, {});
      setPublicStatus(initialPublicStatus);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleNextPage = React.useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = React.useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const handleSwitchChange = async (id) => {
    try {
      const result = await fetch(`https://node-m8jb.onrender.com/edit-toggle/${id}`, {
        method: "PUT",
      });

      if (result.status === 200) {
        const data = await result.json();
        setPublicStatus((prev) => ({ ...prev, [id]: data.status }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toBase64 = (url) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  const exportTable = async (format) => {
    const exportData = await Promise.all(
      filteredProducts.map(async (item, index) => {
        return {
          "Sr. No": (currentPage - 1) * entries + index + 1,
          Product: item.productName,
          ImageURL: item.productThumbnailUrl,
          SKU: item.sku,
          City: item.location?.map((loc) => loc.city?.[0]?.name || "N/A").join(", ") || "N/A",
          Zone: item.location?.[0]?.zone?.[0]?.name || "N/A",
          Price:
            item.variants
              ?.map((v) => `${v.attributeName} - ${v.variantValue} - ₹${v.sell_price}`)
              .slice(0, 2)
              .join(", ") || "N/A",
          Categories: item.category?.map((c) => c.name).join(", "),
          Public: publicStatus[item._id] ? "Yes" : "No",
        };
      })
    );

    if (format === "excel" || format === "csv") {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, `ProductList.${format === "excel" ? "xlsx" : "csv"}`);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Product List", 14, 15);

      const columns = ["Sr. No", "Product", "SKU", "City", "Zone", "Price", "Categories", "Public"];

      const rows = exportData.map((row) => [
        row["Sr. No"],
        row["Product"],
        row["SKU"],
        row["City"],
        row["Zone"],
        row["Price"],
        row["Categories"],
        row["Public"],
      ]);

      const images = await Promise.all(
        exportData.map((row) => toBase64(row.ImageURL).catch(() => null))
      );

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 25,
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          1: { cellWidth: 60 },
        },
        didDrawCell: (data) => {
          if (data.column.index === 1 && data.section === "body") {
            const imgData = images[data.row.index];
            if (imgData) {
              const x = data.cell.x + 2;
              const y = data.cell.y + 2;
              const imgHeight = 15;
              const imgWidth = 15;
              doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
              doc.setFontSize(8);
              doc.text(rows[data.row.index][1], x + imgWidth + 4, y + imgHeight / 1.5);
            }
          }
        },
      });

      doc.save("ProductList.pdf");
    }
  };

  // Handle Popover
  const handlePopoverOpen = (event, data, index, type) => {
    setPopoverAnchorEl(event.currentTarget);
    setPopoverData(data);
    setPopoverIndex(index);
    setPopoverType(type);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setPopoverData([]);
    setPopoverIndex(null);
    setPopoverType("");
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      [
        "Image",
        "productName",
        "Description",
        "Mrp",
        "Price",
        taxInfo.header,
        "Feature Product (0 = false, 1 = true)",
        "Category (CAT = (Main Category Id), SUB = (Sub Category Id), SUBB = (Sub Sub Category Id))",
        "Brand",
        "Attribute",
        "Return Policy (0 = false, 1 = true)",
        "IsVeg (0 = No Food, 1 = Is Food, 2 = Non Veg )",
      ],

      [
        "image1.jpg",
        "Burger",
        "Deluxe burger",
        "150",
        "120",
        "5",
        "1",
        "CAT01",
        "BRD01",
        "VAR03",
        "0",
        "2",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");

    XLSX.writeFile(wb, "sample_products.csv");
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      showAlert("error", "Please upload a valid CSV file");
      return;
    }

    showAlert("loading", "Reading CSV...");
    const reader = new FileReader();

    reader.onload = (event) => {
      let csvText = event.target.result;

      // Remove BOM
      csvText = csvText.replace(/^\uFEFF/, "");

      const workbook = XLSX.read(csvText, { type: "string" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let rows = XLSX.utils.sheet_to_json(sheet, { raw: false });

      rows = rows.map((row) => {
        const cleanRow = {};
        for (const key in row) {
          const cleanedKey = key.replace(/^\uFEFF/, "").trim();
          cleanRow[cleanedKey] = row[key];
        }
        return cleanRow;
      });

      setCsvPreviewRows(rows);
      showAlert("close");
      fetchProducts();
      setOpenCsvPreviewModal(true);
    };

    reader.readAsText(file, "UTF-8"); // <-- VERY IMPORTANT
  };

  return (
    <MDBox
      p={{ xs: 1, sm: 1.5, md: 2 }}
      sx={{
        ml: { xs: 0, lg: miniSidenav ? "80px" : "250px" },
        transition: "margin-left 0.3s ease",
      }}
    >
      <TaxHeader onReady={(tax) => setTaxInfo(tax)} />
      <div style={{ borderRadius: 15, padding: 20, overflowX: "auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ fontWeight: "bold", fontSize: 26 }}>Product List</span>
            <br />
            <span style={{ fontSize: 17 }}>View and manage all products</span>
          </div>
          <div style={{ display: "flex", gap: 15 }}>
            <Button
              style={{
                backgroundColor: "#1976d2",
                height: 45,
                width: 200,
                fontSize: 13,
                color: "white",
                letterSpacing: "1px",
              }}
              onClick={downloadSampleCSV}
            >
              Download Sample CSV
            </Button>

            <Button
              style={{
                backgroundColor: "#ff9800",
                height: 45,
                width: 180,
                fontSize: 13,
                color: "white",
                letterSpacing: "1px",
              }}
              onClick={() => document.getElementById("csvUploadInput").click()}
            >
              Upload CSV
            </Button>

            <input
              id="csvUploadInput"
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleCSVUpload}
            />
          </div>

          <Button
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 160,
              fontSize: 13,
              color: "white",
              letterSpacing: "1px",
            }}
            onClick={() => navigate("/add-product")}
          >
            + Add Product
          </Button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ fontSize: 16 }}>Show Entries:</span>
            <select
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 15 }}>
            <Button
              style={{
                backgroundColor: "#0288d1",
                height: 45,
                width: 200,
                fontSize: 13,
                color: "white",
                letterSpacing: "1px",
              }}
              onClick={() => setOpenFormatModal(true)}
            >
              CSV Format Guide
            </Button>

            <ImagePicker onSelect={(files) => setSelectedImages((prev) => [...prev, ...files])} />
          </div>

          <div style={{ display: "flex", gap: 30 }}>
            <div>
              <label style={{ fontSize: 16 }}>Export:</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  const confirmExport = window.confirm(
                    `Are you sure you want to export as ${val.toUpperCase()}?`
                  );
                  if (confirmExport) exportTable(val);
                }}
                style={{ fontSize: 16, borderRadius: "6px", marginRight: "20px" }}
                defaultValue=""
              >
                <option value="" disabled>
                  Export as
                </option>
                <option value="excel">Export Excel</option>
                <option value="csv">Export CSV</option>
                <option value="pdf">Export PDF</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 16 }}>Filter by City:</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                }}
                style={{ fontSize: 16, borderRadius: "6px" }}
              >
                <option value="">All Cities</option>
                {Array.from(
                  new Set(
                    data
                      .flatMap((p) => p.location?.map((loc) => loc.city?.[0]?.name))
                      .filter(Boolean)
                  )
                ).map((cityName, idx) => (
                  <option key={idx} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 16 }}>Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
                style={{ fontSize: 16, borderRadius: "6px" }}
              >
                <option value="">All Categories</option>
                {Array.from(
                  new Set(data.flatMap((p) => p.category?.map((cat) => cat.name)).filter(Boolean))
                ).map((categoryName, idx) => (
                  <option key={idx} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 16 }}>Search:</label>
              <br />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput); // trigger API call only on Enter
                    setCurrentPage(1); // reset to first page
                  }
                }}
                placeholder="Search..."
                style={{
                  padding: "10px",
                  borderRadius: "20px",
                  height: "40px",
                  width: "200px",
                  border: "1px solid #ccc",
                  fontSize: 16,
                  marginTop: 5,
                }}
              />
            </div>
          </div>
        </div>
        <ImageUploadPanel
          images={selectedImages}
          clearImages={(newArr = []) => setSelectedImages(newArr)}
          onUploaded={(result) => {
            setImageUploadPreview(result);
            setOpenImagePreviewModal(true);
            setBulkUploadedImages(result.images); // <-- perfectly isolated preview
            fetchProducts();
          }}
        />
        {bulkUploadedImages && (
          <div
            style={{
              marginTop: 25,
              padding: 25,
              borderRadius: 12,
              background: "#fff",
              border: "1px solid #ddd",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 15,
                fontSize: 20,
                fontWeight: 700,
                borderBottom: "2px solid #6a1b9a",
                paddingBottom: 8,
                width: "fit-content",
              }}
            >
              Uploaded Images (API Response)
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 18,
              }}
            >
              {bulkUploadedImages.map((img, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #eee",
                    padding: 10,
                    borderRadius: 8,
                    background: "#fafafa",
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.fileName}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  />

                  <div style={{ fontSize: 12 }}>
                    <b>{img.fileName}</b>
                    <br />
                    {img.sizeInKB} KB
                    <br />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CSV Preview Panel */}
        {uploadPreview && (
          <div
            style={{
              marginTop: 25,
              padding: 25,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 15,
                fontSize: 22,
                fontWeight: 700,
                color: "#333",
                borderBottom: "2px solid #1976d2",
                paddingBottom: 8,
                width: "fit-content",
              }}
            >
              CSV Upload Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
              {/* INVALID IMAGES */}
              {uploadPreview.invalidImages.length > 0 && (
                <div
                  style={{
                    padding: 15,
                    borderRadius: 10,
                    background: "#fff8e1",
                    borderLeft: "5px solid #ffb300",
                  }}
                >
                  <h4
                    style={{
                      marginTop: 0,
                      marginBottom: 10,
                      color: "#f57c00",
                      fontWeight: 700,
                    }}
                  >
                    Invalid Images — Placeholder Used
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {uploadPreview.invalidImages.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: 5 }}>
                        <b>Row {item.row}</b> — {item.productName}
                        <span style={{ color: "#e65100" }}> ({item.imageUrl})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SKIPPED ROWS */}
              {uploadPreview.skipped.length > 0 && (
                <div
                  style={{
                    padding: 15,
                    borderRadius: 10,
                    background: "#e3f2fd",
                    borderLeft: "5px solid #d32f2f",
                  }}
                >
                  <h4
                    style={{
                      marginTop: 0,
                      marginBottom: 10,
                      color: "#d32f2f",
                      fontWeight: 700,
                    }}
                  >
                    Skipped Rows
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {uploadPreview.skipped.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: 5 }}>
                        <b>Row {item.row}</b> — {item.productName || "No Name"}
                        <span style={{ color: "#d32f2f" }}> (Reason: {item.reason})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...headerCell, minWidth: "80px" }}>Sr. No</th>
                <th style={{ ...headerCell, minWidth: 250 }}>Product Name</th>
                <th style={headerCell}>SKU</th>
                <th style={{ ...headerCell, width: "130px" }}>City</th>
                <th style={headerCell}>Zone</th>
                <th style={headerCell}>Price</th>
                <th style={headerCell}>Tax</th>
                <th style={headerCell}>Categories</th>
                <th style={headerCell}>Public</th>
                <th style={headerCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item, index) => {
                  const cities =
                    item.location?.map((loc) => loc.city?.[0]?.name).filter(Boolean) || [];
                  const prices =
                    item.variants?.map(
                      (v) => `${v.attributeName} - ${v.variantValue} - ₹${v.sell_price}`
                    ) || [];

                  return (
                    <tr key={item._id}>
                      <td style={{ ...bodyCell, width: "75px" }}>
                        {(currentPage - 1) * entries + index + 1}
                      </td>
                      <td style={{ ...bodyCell, display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={`${process.env.REACT_APP_IMAGE_LINK}${item.productThumbnailUrl}`}
                          alt={item.productThumbnailUrl}
                          style={{
                            width: 60,
                            height: 70,
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                        />
                        <span style={{ fontWeight: "500" }}>{item.productName}</span>
                      </td>
                      <td style={bodyCell}>{item.sku}</td>
                      <td style={bodyCell}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            flexDirection: "row",
                          }}
                        >
                          <div>
                            {cities.slice(0, 2).map((city, idx) => (
                              <Chip
                                key={idx}
                                label={city}
                                size="small"
                                style={{
                                  backgroundColor: "#e3f2fd",
                                  color: "#1976d2",
                                  fontSize: 10,
                                  marginRight: 5,
                                }}
                              />
                            ))}
                          </div>
                          <div>
                            {cities.length > 2 && (
                              <Tooltip title="View all cities">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handlePopoverOpen(e, cities, index, "city")}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                          {!cities.length && <span>N/A</span>}
                        </div>
                        <Popover
                          open={
                            Boolean(popoverAnchorEl) &&
                            popoverIndex === index &&
                            popoverType === "city"
                          }
                          anchorEl={popoverAnchorEl}
                          onClose={handlePopoverClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          <div style={{ padding: "10px", maxWidth: "300px" }}>
                            <Typography variant="h6" style={{ fontSize: 14 }}>
                              All Cities
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 15 }}>
                              {popoverData.map((city, idx) => (
                                <li key={idx} style={{ fontSize: 12 }}>
                                  {city}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Popover>
                      </td>
                      <td style={{ ...bodyCell, width: "140px" }}>
                        {item.location?.[0]?.zone?.[0]?.name?.split(",")[0] || "N/A"}
                      </td>
                      <td style={{ ...bodyCell }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            flexDirection: "row",
                          }}
                        >
                          <div>
                            {item.variants?.slice(0, 2).map((variant, idx) => (
                              <Chip
                                key={idx}
                                label={`${variant.attributeName} - ${variant.variantValue} - ₹${variant.sell_price}`}
                                size="small"
                                style={{
                                  backgroundColor: "#f1f8e9",
                                  color: "#388e3c",
                                  fontSize: 10,
                                }}
                              />
                            ))}
                          </div>
                          <div>
                            {prices.length > 2 && (
                              <Tooltip title="View all prices">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handlePopoverOpen(e, prices, index, "price")}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                          {!item.variants?.length && <span>N/A</span>}
                        </div>
                        <Popover
                          open={
                            Boolean(popoverAnchorEl) &&
                            popoverIndex === index &&
                            popoverType === "price"
                          }
                          anchorEl={popoverAnchorEl}
                          onClose={handlePopoverClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          <div style={{ padding: "10px", maxWidth: "300px" }}>
                            <Typography variant="h6" style={{ fontSize: 14 }}>
                              All Prices
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 15 }}>
                              {popoverData.map((price, idx) => (
                                <li key={idx} style={{ fontSize: 12 }}>
                                  {price}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Popover>
                      </td>
                      <td style={bodyCell}>
                        {item.variants?.length ? (
                          item.variants.slice(0, 2).map((variant, idx) => {
                            const taxPercent = parseFloat(item.tax) || 0;
                            const taxAmount = ((variant.sell_price * taxPercent) / 100).toFixed(2);

                            return (
                              <Chip
                                key={idx}
                                label={`${taxAmount} (${taxPercent}%)`}
                                size="small"
                                style={{
                                  backgroundColor: "#fff3e0",
                                  color: "#e65100",
                                  fontSize: 10,
                                  marginRight: 4,
                                }}
                              />
                            );
                          })
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>

                      <td style={bodyCell}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {item.category?.map((category, idx) => (
                            <Chip
                              key={category._id || idx}
                              label={category.name}
                              size="small"
                              style={{
                                backgroundColor: "#e0f7fa",
                                color: "#007bff",
                                fontSize: 12,
                              }}
                            />
                          ))}
                        </div>
                      </td>
                      <td style={bodyCell}>
                        <Switch
                          checked={publicStatus[item._id] || false}
                          onChange={() => handleSwitchChange(item._id)}
                          color="primary"
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "green",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              backgroundColor: "green !important",
                            },
                            "& .MuiSwitch-track": {
                              backgroundColor: "red",
                              opacity: 1,
                            },
                          }}
                        />
                      </td>
                      <td style={bodyCell}>
                        <IconButton onClick={(e) => handleMenuOpen(e, index)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && menuIndex === index}
                          onClose={handleMenuClose}
                        >
                          <MenuItem
                            onClick={() => navigate("/edit-product", { state: { id: item._id } })}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleDeleteProduct(item._id)}>Delete</MenuItem>
                        </Menu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ ...bodyCell, textAlign: "center" }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
              color: "white",
              padding: "8px 16px",
              borderRadius: 5,
              fontSize: 14,
            }}
          >
            Previous Page
          </Button>
          <span style={{ fontSize: 16 }}>
            Page {currentPage} of {totalPages} (Total: {totalItems} items)
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
              color: "white",
              padding: "8px 16px",
              borderRadius: 5,
              fontSize: 14,
            }}
          >
            Next Page
          </Button>
        </div>
      </div>
      <Modal
        open={openFormatModal}
        onClose={() => setOpenFormatModal(false)}
        aria-labelledby="csv-format-modal"
        sx={{
          backdropFilter: "blur(4px)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            width: "95%",
            maxWidth: 750,
            bgcolor: "#ffffff",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0px -4px 20px rgba(0,0,0,0.1)",
            p: 3,
            maxHeight: "90vh",
            overflowY: "auto",
            animation: "slideUp 0.35s ease-out",
          }}
        >
          {/* Slide animation */}
          <style>
            {`
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      `}
          </style>

          {/* Title Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 20,
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: 10,
            }}
          >
            <InfoIcon style={{ fontSize: 30, color: "#0288d1", marginRight: 12 }} />
            <h2 style={{ margin: 0, fontWeight: 700 }}>CSV Upload Format Guide</h2>
          </div>

          <p style={{ marginTop: 0, fontSize: 15, color: "#555", lineHeight: 1.6 }}>
            Please follow this format to upload products safely without errors. The system validates
            each row and provides a detailed upload summary.
          </p>

          {/* Format Box */}
          <div
            style={{
              background: "#f1f8ff",
              padding: "18px 22px",
              borderRadius: 12,
              borderLeft: "5px solid #0288d1",
              marginBottom: 25,
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 12,
                color: "#01579b",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              Required Columns
            </h3>

            <ul style={{ lineHeight: "1.9", paddingLeft: 20, fontSize: 15 }}>
              <li>
                <b>productName</b> — Product title
              </li>
              <li>
                <b>Feature Product</b> — 0 = Normal, 1 = Featured
              </li>

              <li>
                <b>Category</b> — Supports:
                <ul style={{ paddingLeft: 20 }}>
                  <li>CAT01 (Main category)</li>
                  <li>SUB01 (Sub-category)</li>
                  <li>SUBB02 (Sub-sub-category)</li>
                </ul>
              </li>

              <li>
                <b>Attribute</b> — Example: VAR01:
              </li>

              <li>
                <b>Brand</b> — Example: BRD01
              </li>
              <li>
                <b>Image</b> — Direct image URL (fallback used when invalid)
              </li>
              <li>
                <b>Return Policy</b> — Supports:
                <ul style={{ paddingLeft: 20 }}>
                  <li>0 (No Return)</li>
                  <li>1 (3 Day Return)</li>
                </ul>
              </li>
              <li>
                <b>Description</b> — Product details
              </li>
              <li>
                <b>Mrp</b> — Number
              </li>
              <li>
                <b>Price</b> — Number
              </li>

              <li>
                <b>IsVeg</b> —
                <ul style={{ paddingLeft: 20 }}>
                  <li>0 = Non-food item</li>
                  <li>1 = Veg</li>
                  <li>2 = Non-Veg</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Example Section */}
          <h3
            style={{
              fontWeight: 700,
              marginBottom: 12,
              color: "#333",
            }}
          >
            Example CSV Row
          </h3>

          <div
            style={{
              background: "#fff8e1",
              padding: 15,
              borderRadius: 10,
              border: "1px solid #ffe082",
              marginBottom: 25,
              fontSize: 14,
              overflowX: "auto",
            }}
          >
            <code style={{ color: "#8d6e63" }}>
              Burger,1,CAT01,BRD01,https://image.com/burger.jpg,No Return, Deluxe burger,150,120,2
            </code>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={() => setOpenFormatModal(false)}
              style={{ backgroundColor: "#0288d1", padding: "8px 25px", color: "white" }}
            >
              Close
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal
        open={openCsvPreviewModal}
        onClose={() => setOpenCsvPreviewModal(false)}
        aria-labelledby="csv-preview-modal"
        sx={{ backdropFilter: "blur(4px)" }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            width: "95%",
            maxWidth: 850,
            bgcolor: "#ffffff",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0px -6px 25px rgba(0,0,0,0.12)",
            p: 3,
            maxHeight: "85vh",
            overflowY: "auto",
            animation: "slideUp 0.35s ease-out",
          }}
        >
          <style>
            {`
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `}
          </style>

          <h2 style={{ fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center" }}>
            <InfoIcon style={{ color: "#0288d1", marginRight: 10 }} />
            Preview CSV Before Upload
          </h2>

          <p style={{ color: "#666", marginTop: 0 }}>
            Review your CSV before uploading. This preview is read-only.
          </p>

          {/* TABLE PREVIEW */}
          <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {csvPreviewRows.length > 0 &&
                    Object.keys(csvPreviewRows[0]).map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: 10,
                          background: "#0288d1",
                          color: "white",
                          textAlign: "left",
                          fontSize: 14,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {csvPreviewRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.keys(row).map((col) => (
                      <td
                        key={col}
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid #eee",
                          fontSize: 14,
                          color: "#333",
                          background: rowIndex % 2 === 0 ? "#fafafa" : "#fff",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: 200,
                        }}
                      >
                        {col.toLowerCase() === "image" ? (
                          <img
                            src={`${process.env.REACT_APP_IMAGE_LINK}/ProductImages/${row[col]}`}
                            alt="preview"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #ddd",
                            }}
                            onError={(e) => {
                              e.target.src = "https://placehold.co/60x60/EEEEEE/AAAAAA?text=No+Img";
                            }}
                          />
                        ) : (
                          row[col]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BUTTONS */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => {
                setOpenCsvPreviewModal(false);
                setCsvFile(null);
                document.getElementById("csvUploadInput").value = "";
              }}
              style={{
                background: "#ccc",
                color: "#000",
                padding: "8px 25px",
                borderRadius: 8,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              style={{
                backgroundColor: "#0288d1",
                padding: "8px 25px",
                color: "white",
                borderRadius: 8,
              }}
              onClick={async () => {
                setOpenCsvPreviewModal(false);

                if (!csvFile) {
                  showAlert("error", "CSV file missing. Please re-upload.");
                  return;
                }

                showAlert("loading", "Uploading CSV...");
                const formData = new FormData();
                formData.append("file", csvFile);

                const res = await post(ENDPOINTS.BULK_UPLOAD, formData);

                const result = res.data;
                if (res.status === 201) {
                  showAlert("success", `Uploaded Successfully`);
                  setUploadPreview(result.preview);
                  fetchProducts();
                  document.getElementById("csvUploadInput").value = "";
                  setCsvFile(null);
                } else {
                  showAlert("error", result.message);
                }
              }}
            >
              Confirm Upload
            </Button>
          </div>
        </Box>
      </Modal>
    </MDBox>
  );
}

export default ProductTable;
