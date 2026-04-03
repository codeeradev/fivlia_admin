import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { Button, Menu, MenuItem, IconButton, Switch, Chip, Tooltip, Popover, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ListIcon from "@mui/icons-material/List";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MoreHoriz } from "@mui/icons-material";

// Styles for table headers and cells
const headerCell = {
  padding: "14px 12px",
  border: "1px solid #ddd",
  fontSize: "1rem",
  fontWeight: "bold",
  backgroundColor: "#007bff",
  color: "white",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const bodyCell = {
  padding: "12px",
  border: "1px solid #eee",
  fontSize: "0.9rem",
  backgroundColor: "#fff",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// Inline CSS for responsiveness
const styles = `
  .responsive-table-container {
    overflow-x: auto;
    width: 100%;
  }
  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  .responsive-table th, .responsive-table td {
    min-width: 80px;
  }
  .filter-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 15px;
  }
  .filter-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .filter-item select, .filter-item input {
    font-size: 0.9rem;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
  .card-container {
    display: none;
    flex-direction: column;
    gap: 15px;
  }
  .product-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  .product-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .product-card-content {
    display: grid;
    gap: 8px;
  }
  .product-card-label {
    font-weight: bold;
    font-size: 0.85rem;
    color: #333;
  }
  .product-card-value {
    font-size: 0.85rem;
    color: #555;
  }

  @media (max-width: 900px) {
    .responsive-table th, .responsive-table td {
      font-size: 0.8rem;
      padding: 8px;
    }
    .responsive-table th:nth-child(5), .responsive-table td:nth-child(5) {
      display: none; /* Hide Zone column */
    }
    .responsive-table th:nth-child(8), .responsive-table td:nth-child(8) {
      display: none; /* Hide Stock column */
    }
    .filter-item select, .filter-item input {
      font-size: 0.8rem;
      padding: 6px;
    }
  }

  @media (max-width: 600px) {
    .responsive-table-container {
      display: none; /* Hide table on mobile */
    }
    .card-container {
      display: flex; /* Show card layout */
    }
    .filter-container {
      flex-direction: column;
      align-items: flex-start;
    }
    .filter-item {
      width: 100%;
    }
    .filter-item input {
      width: 100%;
      box-sizing: border-box;
    }
    .filter-item select {
      width: 100%;
    }
  }
`;

function StoreProduct() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(30);
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [publicStatus, setPublicStatus] = useState({});
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [popoverData, setPopoverData] = useState([]);
  const [popoverIndex, setPopoverIndex] = useState(null);
  const [popoverType, setPopoverType] = useState("");
  const [products, setProducts] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("storeId");
    setStoreId(id);
  }, []);

  useEffect(() => {
    const getStoreDetails = async () => {
      if (!storeId) return;
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getStore?id=${storeId}`);
        if (response.status === 200) {
          const result = await response.json();
          const { store, categories, products } = result;

          const transformedProducts = products.map((product) => ({
            ...product,
            location: product.location || [],
            variants: product.variants || [],
            category: product.category || [],
            productThumbnailUrl: product.productImageUrl?.[0] || "",
          }));

          setProducts(transformedProducts);
          setData(transformedProducts);
        } else {
          console.error("API Error: Status", response.status);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    getStoreDetails();
  }, [storeId]);

  const filteredProducts = Array.isArray(data)
    ? data
        .filter((item) =>
          selectedCity
            ? item.location?.some((loc) => loc.city?.[0]?.name === selectedCity)
            : true
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

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / entries);
  const startIndex = (currentPage - 1) * entries;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + entries);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
          "Sr. No": index + 1,
          Product: item.productName,
          ImageURL: item.productThumbnailUrl,
          SKU: item.sku,
          City: item.location?.map((loc) => loc.city?.[0]?.name || "N/A").join(", ") || "N/A",
          Zone: item.location?.[0]?.zone?.[0]?.name || "N/A",
          Price: item.variants
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

      const columns = [
        "Sr. No",
        "Product",
        "SKU",
        "City",
        "Zone",
        "Price",
        "Categories",
        "Public",
      ];

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
              doc.text(
                rows[data.row.index][1],
                x + imgWidth + 4,
                y + imgHeight / 1.5
              );
            }
          }
        },
      });

      doc.save("ProductList.pdf");
    }
  };

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

  return (
    <>
      {/* Inject CSS styles */}
      <style>{styles}</style>
      <MDBox
        p={2}
        style={{
          marginLeft: miniSidenav ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div style={{ borderRadius: 15, padding: 20 }}>
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
              <span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Product List</span>
              <br />
              <span style={{ fontSize: "1rem" }}>View and manage all products</span>
            </div>
          </div>

          <div className="filter-container">
            <div className="filter-item">
              <span style={{ fontSize: "0.9rem" }}>Show Entries:</span>
              <select
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={70}>70</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="filter-item">
              <label style={{ fontSize: "0.9rem" }}>Export:</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  const confirmExport = window.confirm(
                    `Are you sure you want to export as ${val.toUpperCase()}?`
                  );
                  if (confirmExport) exportTable(val);
                }}
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
            <div className="filter-item">
              <label style={{ fontSize: "0.9rem" }}>Filter by City:</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Cities</option>
                {Array.from(
                  new Set(
                    data.flatMap((p) => p.location?.map((loc) => loc.city?.[0]?.name)).filter(
                      Boolean
                    )
                  )
                ).map((cityName, idx) => (
                  <option key={idx} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label style={{ fontSize: "0.9rem" }}>Search:</label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                style={{
                  padding: "8px",
                  borderRadius: "20px",
                  height: "40px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          <div className="responsive-table-container">
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Typography>Loading products...</Typography>
              </div>
            ) : (
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th style={{ ...headerCell, minWidth: "80px" }}>Sr. No</th>
                    <th style={{ ...headerCell, minWidth: "200px" }}>Product Name</th>
                    <th style={{ ...headerCell, minWidth: "100px" }}>SKU</th>
                    <th style={{ ...headerCell, minWidth: "100px" }}>City</th>
                    <th style={{ ...headerCell, minWidth: "80px" }}>Zone</th>
                    <th style={{ ...headerCell, minWidth: "150px" }}>Price</th>
                    <th style={{ ...headerCell, minWidth: "150px" }}>Categories</th>
                    <th style={{ ...headerCell, minWidth: "80px" }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((item, index) => {
                      const cities = item.location?.map((loc) => loc.city?.[0]?.name).filter(Boolean) || [];
                      const prices = item.variants?.map(
                        (v) => `${v.attributeName} - ${v.variantValue} - ₹${v.sell_price}`
                      ) || [];

                      return (
                        <tr key={item._id}>
                          <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + index + 1}</td>
                          <td style={{ ...bodyCell, display: "flex", alignItems: "center", gap: 10 }}>
                            <img
                              src={`${process.env.REACT_APP_IMAGE_LINK}${item.productThumbnailUrl || "https://via.placeholder.com/60"}`}
                              alt={item.productName}
                              style={{
                                width: 60,
                                height: 70,
                                borderRadius: 6,
                                objectFit: "cover",
                              }}
                            />
                            <span style={{ fontWeight: "500" }}>{item.productName}</span>
                          </td>
                          <td style={{ ...bodyCell, textAlign: "center" }}>{item.sku || "N/A"}</td>
                          <td style={{ ...bodyCell }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, flexDirection: "row" }}>
                              <div>
                                {cities.slice(0, 1).map((city, idx) => (
                                  <Chip
                                    key={idx}
                                    label={city}
                                    size="small"
                                    style={{
                                      backgroundColor: "#e3f2fd",
                                      color: "#1976d2",
                                      fontSize: "0.7rem",
                                      marginRight: 5,
                                    }}
                                  />
                                ))}
                              </div>
                              <div>
                                {cities.length > 1 && (
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
                              open={Boolean(popoverAnchorEl) && popoverIndex === index && popoverType === "city"}
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
                                <Typography variant="h6" style={{ fontSize: "0.9rem" }}>
                                  All Cities
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 15 }}>
                                  {popoverData.map((city, idx) => (
                                    <li key={idx} style={{ fontSize: "0.8rem" }}>
                                      {city}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </Popover>
                          </td>
                          <td style={{ ...bodyCell, textAlign: "center" }}>
                            {item.location?.[0]?.zone?.[0]?.name?.split(",")[0] || "N/A"}
                          </td>
                          <td style={{ ...bodyCell }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, flexDirection: "row" }}>
                              <div>
                                {item.variants?.slice(0, 1).map((variant, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`${variant.attributeName} - ${variant.variantValue} - ₹${variant.sell_price}`}
                                    size="small"
                                    style={{
                                      backgroundColor: "#f1f8e9",
                                      color: "#388e3c",
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                ))}
                              </div>
                              <div>
                                {prices.length > 1 && (
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
                              open={Boolean(popoverAnchorEl) && popoverIndex === index && popoverType === "price"}
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
                                <Typography variant="h6" style={{ fontSize: "0.9rem" }}>
                                  All Prices
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 15 }}>
                                  {popoverData.map((price, idx) => (
                                    <li key={idx} style={{ fontSize: "0.8rem" }}>
                                      {price}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </Popover>
                          </td>
                          <td style={{ ...bodyCell }}>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              {item.category?.map((category, idx) => (
                                <Chip
                                  key={category._id || idx}
                                  label={category.name}
                                  size="small"
                                  style={{
                                    backgroundColor: "#e0f7fa",
                                    color: "#007bff",
                                    fontSize: "0.7rem",
                                  }}
                                />
                              ))}
                            </div>
                          </td>
                          <td style={{ ...bodyCell, textAlign: "center" }}>N/A</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ ...bodyCell, textAlign: "center" }}>
                        {data.length === 0 && !loading ? "No products found" : "Loading..."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Card layout for mobile */}
          <div className="card-container">
            {loading ? (
              <Typography style={{ textAlign: "center", padding: "20px" }}>
                Loading products...
              </Typography>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((item, index) => {
                const cities = item.location?.map((loc) => loc.city?.[0]?.name).filter(Boolean) || [];
                const prices = item.variants?.map(
                  (v) => `${v.attributeName} - ${v.variantValue} - ₹${v.sell_price}`
                ) || [];

                return (
                  <div key={item._id} className="product-card">
                    <div className="product-card-header">
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${item.productThumbnailUrl || "https://via.placeholder.com/60"}`}
                        alt={item.productName}
                        style={{
                          width: 50,
                          height: 60,
                          borderRadius: 6,
                          objectFit: "cover",
                        }}
                      />
                      <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{item.productName}</span>
                    </div>
                    <div className="product-card-content">
                      <div>
                        <span className="product-card-label">Sr. No:</span>
                        <span className="product-card-value">{startIndex + index + 1}</span>
                      </div>
                      <div>
                        <span className="product-card-label">SKU:</span>
                        <span className="product-card-value">{item.sku || "N/A"}</span>
                      </div>
                      <div>
                        <span className="product-card-label">City:</span>
                        <span className="product-card-value">
                          {cities.length > 0 ? (
                            <>
                              {cities.slice(0, 1).map((city, idx) => (
                                <Chip
                                  key={idx}
                                  label={city}
                                  size="small"
                                  style={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
                                    fontSize: "0.7rem",
                                    marginRight: 5,
                                  }}
                                />
                              ))}
                              {cities.length > 1 && (
                                <Tooltip title="View all cities">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handlePopoverOpen(e, cities, index, "city")}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </span>
                        <Popover
                          open={Boolean(popoverAnchorEl) && popoverIndex === index && popoverType === "city"}
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
                            <Typography variant="h6" style={{ fontSize: "0.9rem" }}>
                              All Cities
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 15 }}>
                              {popoverData.map((city, idx) => (
                                <li key={idx} style={{ fontSize: "0.8rem" }}>
                                  {city}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Popover>
                      </div>
                      <div>
                        <span className="product-card-label">Price:</span>
                        <span className="product-card-value">
                          {item.variants?.length > 0 ? (
                            <>
                              {item.variants.slice(0, 1).map((variant, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${variant.attributeName} - ${variant.variantValue} - ₹${variant.sell_price}`}
                                  size="small"
                                  style={{
                                    backgroundColor: "#f1f8e9",
                                    color: "#388e3c",
                                    fontSize: "0.7rem",
                                    marginRight: 5,
                                  }}
                                />
                              ))}
                              {prices.length > 1 && (
                                <Tooltip title="View all prices">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handlePopoverOpen(e, prices, index, "price")}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </span>
                        <Popover
                          open={Boolean(popoverAnchorEl) && popoverIndex === index && popoverType === "price"}
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
                            <Typography variant="h6" style={{ fontSize: "0.9rem" }}>
                              All Prices
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 15 }}>
                              {popoverData.map((price, idx) => (
                                <li key={idx} style={{ fontSize: "0.8rem" }}>
                                  {price}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Popover>
                      </div>
                      <div>
                        <span className="product-card-label">Categories:</span>
                        <span className="product-card-value">
                          {item.category?.length > 0 ? (
                            item.category.map((category, idx) => (
                              <Chip
                                key={category._id || idx}
                                label={category.name}
                                size="small"
                                style={{
                                  backgroundColor: "#e0f7fa",
                                  color: "#007bff",
                                  fontSize: "0.7rem",
                                  marginRight: 5,
                                  marginBottom: 5,
                                }}
                              />
                            ))
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <Typography style={{ textAlign: "center", padding: "20px" }}>
                {data.length === 0 && !loading ? "No products found" : "Loading..."}
              </Typography>
            )}
          </div>

          {!loading && paginatedProducts.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
                flexWrap: "wrap",
                gap: 10,
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
                  fontSize: "0.9rem",
                }}
              >
                Previous Page
              </Button>
              <span style={{ fontSize: "0.9rem" }}>
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
                  fontSize: "0.9rem",
                }}
              >
                Next Page
              </Button>
            </div>
          )}
        </div>
      </MDBox>
    </>
  );
}

export default StoreProduct;