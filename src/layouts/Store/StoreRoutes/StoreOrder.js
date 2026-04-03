import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
} from "@mui/material";

const styles = `
  .order-container {
    width: 100%;
    font-family: 'Urbanist', sans-serif;
  }
  .order-box {
    width: 100%;
    border-radius: 15px;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
  }
  .controls-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }
  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .control-item label {
    font-size: 16px;
    color: #333;
  }
  .control-item select, .control-item input {
    font-size: 16px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    outline: none;
  }
  .search-input {
    border-radius: 20px;
    height: 45px;
    width: 200px;
    padding-left: 15px;
  }
  .table-container {
    overflow-x: auto;
    width: 100%;
  }
      .download-button {
            padding: 8px 16px;
            border-radius: 8px;
            border: none;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.3s, transform 0.2s;
          }
  .orders-table {
    width: 100%;
    border-collapse: collapse;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
    border: 1px solid #007bff;
  }
  .header-cell {
    padding: 14px 12px;
    border: 1px solid #ddd;
    font-size: 18px;
    font-weight: bold;
    background-color: #007bff;
    color: white;
    text-align: left;
  }
  .body-cell {
    padding: 12px;
    border: 1px solid #eee;
    font-size: 17px;
    background-color: #fff;
    text-align: left;
  }
  .truncate-text {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }
  .pagination button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
  }
  .pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .error-message {
    color: #d32f2f;
    font-size: 14px;
    margin-top: 5px;
  }
  .edit-button {
    background-color: #007bff;
    color: white;
    font-weight: bold;
    text-transform: capitalize;
  }
  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 16px;
    max-width: 90%;
    width: 800px;
    margin: 5% auto;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    border: 1px solid #e0e0e0;
    position: relative;
    max-height: 80vh;
    overflow-y: auto;
  }
  .modal-close {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    font-weight: bold;
    z-index: 1;
  }
  .modal-close:hover {
    color: #333;
  }
  .modal-table-container {
    overflow-x: auto;
    margin-top: 16px;
  }
  .modal-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .modal-table th,
  .modal-table td {
    border: 1px solid #e0e0e0;
    padding: 8px;
    text-align: left;
  }
  .modal-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  .modal-table tbody tr:nth-child(even) {
    background-color: #fafafa;
  }
  .item-link {
    color: #007bff;
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
  .modal-header {
    font-size: 20px;
    font-weight: 600;
    color: #1a237e;
    margin-bottom: 12px;
  }
  .modal-button {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .modal-button:hover {
    transform: translateY(-1px);
  }
  .status-select {
    border-radius: 6px;
    background: #f8f9fa;
    border: 1px solid #007bff;
  }
  .status-select .MuiSelect-select {
    padding: 10px 14px;
    font-size: 16px;
    color: #344767;
  }
  .status-select .MuiOutlinedInput-notchedOutline {
    border: none;
  }
  .status-display {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
  .status-image {
    width: 20px;
    height: 20px;
    object-fit: contain;
    border-radius: 2px;
  }
  .status-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
  }
  .status-menu-item img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    border-radius: 3px;
  }
  @media (max-width: 768px) {
    .controls-container {
      flex-direction: column;
      align-items: flex-start;
    }
    .control-item {
      width: 100%;
    }
    .control-item select, .control-item input {
      width: 100%;
      box-sizing: border-box;
    }
    .modal-content {
      width: 90%;
      margin: 10% auto;
    }
  }
`;

function StoreOrder({ isDashboard = false }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [orders, setOrders] = useState([]);
  const [variants, setVariants] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [deliveryStatuses, setDeliveryStatuses] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storeId = localStorage.getItem("storeId");
        if (!storeId) {
          alert("Store ID missing");
          return setError("Store ID missing");
        }

        const res = await fetch(`${process.env.REACT_APP_API_URL}/orders?storeId=${storeId}`);
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setError("");
        } else {
          alert("Invalid orders data");
          setError("Invalid orders data");
        }
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading orders:", err);
        alert("Failed to load orders");
        setError("Failed to load orders");
      }
    };

    const fetchDrivers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/getDriver`);
        const data = await res.json();
        if (data.Driver && Array.isArray(data.Driver)) {
          setDrivers(data.Driver);
        } else {
          alert("Invalid drivers data");
          setDrivers([]);
        }
      } catch (err) {
        console.error("Error fetching drivers:", err);
        alert("Failed to fetch drivers");
      }
    };

    const fetchDeliveryStatuses = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/getdeliveryStatus`);
        const data = await res.json();
        if (data.Status && Array.isArray(data.Status)) {
          setDeliveryStatuses(data.Status);
        } else {
          console.error("Invalid delivery statuses data");
          setDeliveryStatuses([]);
        }
      } catch (err) {
        console.error("Error fetching delivery statuses:", err);
        setDeliveryStatuses([]);
      }
    };

    fetchOrders();
    fetchDrivers();
    fetchDeliveryStatuses();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order._id?.toLowerCase().includes(search) ||
      (order.addressId?.fullAddress?.toLowerCase().includes(search) || "") ||
      (order.orderStatus?.toLowerCase().includes(search) || "") ||
      (order.paymentStatus?.toLowerCase().includes(search) || "")
    );
  });

  // For dashboard, show only 10 most recent orders
  const dashboardOrders = isDashboard ? filteredOrders.slice(0, 10) : filteredOrders;
  
  const totalPages = Math.ceil(filteredOrders.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentOrders = isDashboard ? dashboardOrders : filteredOrders.slice(startIndex, startIndex + entriesToShow);

  const statusColor = (status) => {
    if (!status) return "#999";
    
    // Map status codes to colors
    const statusCodeMap = {
      "100": "#ff9800", // Pending - Orange
      "101": "#2196f3", // Accepted - Blue
      "102": "#9c27b0", // Picked Up - Purple
      "103": "#ff5722", // On The Way - Deep Orange
      "104": "#f44336", // Cancelled - Red
      "105": "#4caf50", // Going to Pickup - Green
      "106": "#4caf50", // Delivered - Green
    };

    // Check if status is a code first
    if (statusCodeMap[status]) {
      return statusCodeMap[status];
    }

    // Fallback to string matching
    switch (status.toLowerCase()) {
      case "successful":
      case "delivered":
        return "#4caf50";
      case "pending":
        return "#ff9800";
      case "accepted":
        return "#2196f3";
      case "picked up":
      case "picked":
        return "#9c27b0";
      case "on the way":
      case "on the way":
        return "#ff5722";
      case "cancelled":
      case "failed":
        return "#f44336";
      case "going to pickup":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  const getStatusInfo = (status) => {
    if (!status) return { title: "-", image: null };
    
    // Find status in delivery statuses array
    const statusInfo = deliveryStatuses.find(s => s.statusCode === status || s.statusTitle === status);
    
    if (statusInfo) {
      return {
        title: statusInfo.statusTitle,
        image: statusInfo.image,
        code: statusInfo.statusCode
      };
    }
    
    // Fallback to status string
    return { title: status, image: null };
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const openAddressModal = (order) => {
    setSelectedOrder(order);
    setAddressModalOpen(true);
  };

// Function to download invoice PDF
const handleDownloadInvoice = async (orderId) => {
 try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/thermal-invoice/${orderId}`, {
      method: "GET", // Or POST, depending on route
    });

    if (!res.ok) throw new Error("Failed to fetch PDF");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `thermal_invoice_${orderId}.pdf`;
    link.click();

    // Cleanup URL object
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading invoice:", err);
  }
};


  const openEditModal = (order) => {
    setSelectedOrder(order);
    // Try to find the status code for the current order status
    const currentStatusInfo = deliveryStatuses.find(s => 
      s.statusCode === order.orderStatus || s.statusTitle === order.orderStatus
    );
    setNewStatus(currentStatusInfo ? currentStatusInfo.statusCode : order.orderStatus || "");
    setEditModalOpen(true);
  };

  const closeModal = () => {
    setDetailsModalOpen(false);
    setAddressModalOpen(false);
    setEditModalOpen(false);
    setSelectedOrder(null);
    setNewStatus("");
  };

  const handleSave = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      // Get the status title for the selected status code
      const statusInfo = deliveryStatuses.find(s => s.statusCode === newStatus);
      const statusTitle = statusInfo ? statusInfo.statusTitle : newStatus;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/orderStatus/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusTitle }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedOrders = orders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, orderStatus: data.update.orderStatus }
            : order
        );
        setOrders(updatedOrders);
        closeModal();
      } else {
        alert("Failed to update status");
        setError("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Error updating status");
      setError("Error updating order status");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <MDBox
        p={2}
        style={{ 
          marginLeft: isDashboard ? "0px" : (miniSidenav ? "80px" : "250px"), 
          transition: "margin-left 0.3s ease" 
        }}
      >
        <div className="order-container">
          <div className="order-box">
            {!isDashboard && (
              <div className="header">
                <div>
                  <span style={{ fontWeight: "bold", fontSize: 26 }}>Orders</span>
                  <br />
                  <span style={{ fontSize: 16 }}>View and manage orders</span>
                </div>
              </div>
            )}

            {!isDashboard && (
              <div className="controls-container">
                <div className="control-item">
                  <label>Entries</label>
                  <select
                    value={entriesToShow}
                    onChange={(e) => setEntriesToShow(Number(e.target.value))}
                  >
                    {[5, 10, 20].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="control-item">
                  <label>Search</label>
                  <input
                    className="search-input"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th className="header-cell">No.</th>
                    <th className="header-cell">Order ID</th>
                    <th className="header-cell">Details</th>
                    <th className="header-cell">Address</th>
                    <th className="header-cell">Invoice</th>
                    <th className="header-cell">Payment</th>
                    <th className="header-cell">Status</th>
                    <th className="header-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order, index) => {
                      const item = order.items?.[0];
                      return (
                        <tr key={order._id}>
                          <td className="body-cell">{startIndex + index + 1}</td>
                          <td className="body-cell">{order.orderId || "-"}</td>
                           <td className="body-cell order-details-cell">
                            <span
                              className="item-link"
                              onClick={() => openDetailsModal(order)}
                              style={{ cursor: "pointer",  display: "block", fontWeight: 500 }}
                            >
                              ₹{order.totalPrice?.toFixed(2) || 0}
                            </span>
                            <span style={{ color: "#7b809a", fontSize: "13px" }}>
                              Quantity: {item?.quantity || 0}
                            </span>
                          </td>
                          <td
                            className="body-cell"
                            onClick={() => openAddressModal(order)}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="truncate-text">{truncateText(order.addressId?.fullAddress)}</span>
                          </td>
                          <td className="body-cell">
                            <button
                              className="download-button"
                              onClick={() => handleDownloadInvoice(order.orderId)}
                            >
                              Download
                            </button>
                          </td>
                          <td
                            className="body-cell"
                            style={{ color: statusColor(order.paymentStatus) }}
                          >
                            {order.paymentStatus || "-"}
                          </td>
                          <td
                            className="body-cell"
                            style={{ color: statusColor(order.orderStatus) }}
                          >
                            {(() => {
                              const statusInfo = getStatusInfo(order.orderStatus);
                              return (
                                <div className="status-display">
                                  {statusInfo.image && (
                                    <img
                                      src={`${process.env.REACT_APP_IMAGE_LINK}${statusInfo.image}`}
                                      alt={statusInfo.title}
                                      className="status-image"
                                    />
                                  )}
                                  <span>{statusInfo.title}</span>
                                </div>
                              );
                            })()}
                          </td>
                          <td
                            className="body-cell"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              className="edit-button"
                              onClick={() => openEditModal(order)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="body-cell"
                        style={{ textAlign: "center" }}
                      >
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!isDashboard && (
              <div className="pagination">
                <span>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + entriesToShow, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </span>
                <div>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </MDBox>

      <Modal open={detailsModalOpen} onClose={closeModal}>
        <div className="modal-content">
          <span className="modal-close" onClick={closeModal}>×</span>
            {selectedOrder && (
              <>
                <h3 style={{ fontWeight: 700, fontSize: "24px", color: "#344767", marginBottom: "24px" }}>
                  Order Details - {selectedOrder.orderId}
                </h3>
                <div style={{ marginBottom: "16px", fontSize: "14px", color: "#344767" }}>
                  <strong>Status:</strong> {selectedOrder.orderStatus || ""}
                </div>
                <div className="modal-table-container">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Sr No</th>
                        <th style={{ width: "100px" }}>Price</th>
                        <th style={{ width: "100px" }}>Quantity</th>
                        <th style={{ width: "250px" }}>Product</th>
                        <th style={{ width: "250px" }}>Sku</th>
                        <th style={{ width: "150px" }}>Variant</th>
                        <th style={{ width: "120px" }}>Price (Incl. GST)</th>
                        <th style={{ width: "120px" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => {
                        const variant = variants[item.productId?.$oid || item.productId]?.find(
                          (v) => (v._id?.$oid || v._id) === (item.varientId?.$oid || item.varientId)
                        );
                        const price = item.price || 0;
                        const subtotal = item.quantity * price;
                        return (
                          <tr key={item._id?.$oid || item._id}>
                            <td style={{ fontSize: "14px", padding: "16px" }}>{index + 1}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>₹{price}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>{item.quantity || 0}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>
                              <img
                                src={`${process.env.REACT_APP_IMAGE_LINK}${item.image}`}
                                alt={item.name}
                                style={{ width: 48, height: 48, objectFit: "cover", marginRight: 12 }}
                              />
                              <span className="item-link" title={item.name}>
                                {item.name || "-"}
                              </span>
                            </td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>{item.sku || ""}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>{item.variantName || "-"}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>₹{price}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>₹{subtotal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="6" style={{ textAlign: "right", fontWeight: 600, padding: "16px", fontSize: "14px" }}>
                          Subtotal (Incl. GST):
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>
                          ₹{selectedOrder.items.reduce((sum, item) =>
                            sum + (item.quantity * (item.price || 0)), 0)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="6" style={{ textAlign: "right", fontWeight: 600, padding: "16px", fontSize: "14px" }}>
                          GST Breakdown ({selectedOrder.items[0]?.gst || "0%"}):
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>
                          ₹{selectedOrder.items.reduce((sum, item) => {
                            const price = item.quantity * (item.variantPrice || item.price || 0);
                            const gstRate = parseFloat(item.gst || "0") / 100;
                            return sum + price * gstRate;
                          }, 0).toFixed(2)} <br />
                          <small style={{ color: "#7b809a", fontSize: "12px" }}>(Already included in prices)</small>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="6" style={{ textAlign: "right", fontWeight: 600, padding: "16px", fontSize: "14px" }}>
                          Delivery Charges:
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>₹{selectedOrder.deliveryCharges || 0}</td>
                      </tr>
                      <tr>
                        <td colSpan="6" style={{ textAlign: "right", fontWeight: 600, padding: "16px", fontSize: "14px" }}>
                          Platform Fee(%):
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>{selectedOrder.platformFee || 0}</td>
                      </tr>
                      <tr style={{ borderTop: "2px solid #d2d6da" }}>
                        <td colSpan="6" style={{ textAlign: "right", fontWeight: 700, padding: "16px", fontSize: "15px" }}>
                          Total Payable Amount:
                        </td>
                        <td style={{ fontSize: "15px", padding: "16px" }}>
                          ₹{selectedOrder.totalPrice?.toFixed(2) || (
                            (
                              selectedOrder.items.reduce((sum, item) => {
                                const price = item.quantity * (item.variantPrice || item.price || 0);
                                return sum + price;
                              }, 0) +
                              (selectedOrder.deliveryCharges || 0) +
                              (selectedOrder.platformFee || 0)
                            ).toFixed(2)
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div style={{ marginTop: "16px", fontSize: "13px", color: "#7b809a" }}>
                  <em>Note: GST is already included in the product prices.</em>
                </div>
              </>
            )}
          </div>
        </Modal>

      <Modal open={addressModalOpen} onClose={closeModal}>
        <Box className="modal-content">
          <Typography className="modal-header">Delivery Address</Typography>
          <Typography sx={{ fontSize: '14px', color: '#344767' }}>
            {selectedOrder?.addressId?.fullAddress || "No address available"}
          </Typography>
          <Box mt={2}>
            <Button
              className="modal-button"
              variant="contained"
              onClick={closeModal}
              sx={{
                background: '#007bff',
                color: 'white',
                width: '100%',
                '&:hover': { background: '#0056b3' }
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={editModalOpen} onClose={closeModal}>
        <Box className="modal-content">
          <Typography className="modal-header">Edit Order Status</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              className="status-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <em style={{ color: '#999' }}>Select Status</em>;
                }
                const statusInfo = getStatusInfo(selected);
                return (
                  <div className="status-display">
                    {statusInfo.image && (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${statusInfo.image}`}
                        alt={statusInfo.title}
                        className="status-image"
                      />
                    )}
                    <span>{statusInfo.title}</span>
                  </div>
                );
              }}
            >
              <MenuItem value="" disabled>
                <em>Select Status</em>
              </MenuItem>
              {deliveryStatuses.map((status) => (
                <MenuItem key={status._id} value={status.statusCode}>
                  <div className="status-menu-item">
                    <img
                      src={`${process.env.REACT_APP_IMAGE_LINK}${status.image}`}
                      alt={status.statusTitle}
                    />
                    <span>{status.statusTitle}</span>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="space-between" gap={2}>
            <Button
              className="modal-button"
              variant="outlined"
              onClick={closeModal}
              sx={{ borderColor: '#007bff', color: '#007bff', '&:hover': { background: '#e6f0ff' } }}
            >
              Cancel
            </Button>
            <Button
              className="modal-button"
              variant="contained"
              onClick={handleSave}
              disabled={!newStatus}
              sx={{
                background: '#007bff',
                color: 'white',
                '&:hover': { background: '#0056b3' },
                '&:disabled': { background: '#ccc', color: '#666' }
              }}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default StoreOrder;