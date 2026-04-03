import React, { useState, useEffect, useCallback } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import Modal from "@mui/material/Modal";
import { FaSortUp, FaSortDown, FaMapMarkerAlt, FaUser, FaPhoneAlt } from "react-icons/fa";
import { CSVLink } from "react-csv";
import { io } from "socket.io-client";
import { showAlert } from "components/commonFunction/alertsLoader";
import { getAllZones } from "components/commonApi/commonApi";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

const Orders = ({ showHeader = true, isDashboard = false }) => {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [socket, setSocket] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [zones, setZones] = useState([]);
  const [variants, setVariants] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [deliveryStatuses, setDeliveryStatuses] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  // const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [driverUpdating, setDriverUpdating] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all | temp
  const [tempOrders, setTempOrders] = useState([]);

  const restrictedStatuses = ["Going to Pickup", "Picked Up", "On The Way", "Delivered"];

  const fetchData = useCallback(async () => {
    showAlert("loading", "Loading orders...");

    try {
      const [ordersRes, tempOrdersRes, storesRes, zonesRes, driversRes, statusesRes] =
        await Promise.all([
          get(ENDPOINTS.GET_ORDERS),
          get(ENDPOINTS.GET_TEMP_ORDERS),
          get(ENDPOINTS.GET_STORE),
          getAllZones(), // common API
          get(ENDPOINTS.GET_DRIVERS),
          get(ENDPOINTS.GET_DELIVERY_STATUS),
        ]);
      // Handle Orders
      const ordersData = ordersRes.data;
      const storesData = storesRes.data;
      const zonesData = zonesRes.data;
      const driversData = driversRes.data;
      const statusesData = statusesRes.data;

      // console.log("Orders API response:", ordersData);
      if (ordersData?.orders) setOrders(ordersData.orders);
      if (tempOrdersRes.data?.tempOrders) setTempOrders(tempOrdersRes.data.tempOrders);

      // Handle Stores
      // console.log("Stores API response:", storesData);
      if (storesData?.stores) {
        setStores(
          storesData.stores.map((s) => ({
            id: s._id?.$oid || s._id,
            name: s.storeName,
            address:
              s.Latitude && s.Longitude
                ? `${s.Latitude}, ${s.Longitude}`
                : s.city?.name || "Unknown",
            zones: Array.isArray(s.zone)
              ? s.zone.map((z) => ({
                  id: z._id?.$oid || z._id,
                  title: z.title || "Unknown",
                }))
              : [],
          }))
        );
      }

      // console.log("Zones API response:", zonesData);
      if (Array.isArray(zonesData)) {
        setZones(
          zonesData.flatMap(
            (city) =>
              city?.zones?.map((zone) => ({
                id: zone._id?.$oid || zone._id,
                title: zone.zoneTitle || "Unknown",
                city: city.city || "Unknown",
              })) || []
          )
        );
      }
      if (driversData?.Driver) {
        setDrivers(
          driversData.Driver.map((d) => ({
            id: d._id,
            driverId: d.driverId,
            name: d.driverName,
          }))
        );
      }

      // Delivery statuses
      if (statusesData?.Status) {
        const unique = [
          ...new Set(
            statusesData.Status.map((s) => (s.statusTitle || s.status || s.name || "").trim())
          ),
        ]
          .filter(Boolean)
          .map((s) => s[0].toUpperCase() + s.slice(1))
          .sort();

        setDeliveryStatuses(unique);
      }

      showAlert("success", "Orders loaded");
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load data");
    }
  }, []);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Join admin room
    newSocket.emit("joinAdmin");

    // Listen for new orders
    newSocket.on("storeOrder", (data) => {
      console.log("🟢 New order received for admin:", data);

      fetchData();
    });
    return () => {
      newSocket.disconnect();
    };
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setOrders((prev) =>
      [...prev].sort((a, b) => {
        let aValue = a[key];
        let bValue = b[key];
        if (key === "items[0].name") {
          aValue = a.items?.[0]?.name || "";
          bValue = b.items?.[0]?.name || "";
        }
        if (key === "addressId.fullAddress") {
          aValue = a.addressId?.fullAddress || "";
          bValue = b.addressId?.fullAddress || "";
        }
        if (key === "storeId.storeName") {
          aValue = a.storeId?.storeName || "";
          bValue = b.storeId?.storeName || "";
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  const handleStatusChange = (orderId, newStatus) => {
    const order = orders.find((o) => o._id === orderId);
    if (restrictedStatuses.includes(newStatus) && !order.driver?.driverId && !order.driverId) {
      setPendingOrderId(orderId);
      setPendingStatus(newStatus);
      setShowDriverModal(true);
      return;
    }
    handleOrderUpdate(orderId, newStatus, undefined);
  };

  const handleDriverSelection = async (mongoId) => {
    console.log("mongoId", mongoId);
    if (!mongoId) {
      setShowDriverModal(false);
      return;
    }
    await handleOrderUpdate(pendingOrderId, pendingStatus, mongoId);
    setShowDriverModal(false);
    setPendingOrderId(null);
    setPendingStatus(null);
  };

  const handleOrderUpdate = async (id, status, driverId) => {
    setStatusUpdating(true);
    setDriverUpdating(true);
    showAlert("loading", "Updating order...");
    try {
      const body = {};
      if (status) body.status = status;
      if (driverId) body.driverId = driverId;
      const res = await put(`${ENDPOINTS.UPDATE_ORDER_STATUS}/${id}`, body);
      const updated = res.data.update;

      if (!updated) {
        showAlert("error", "Failed to update order");
        return;
      }
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? {
                ...order,
                orderStatus: updated.orderStatus,
                driver: updated.driver,
              }
            : order
        )
      );
      setSelectedOrder((prev) =>
        prev?._id === id
          ? {
              ...prev,
              orderStatus: updated.orderStatus,
              driver: updated.driver,
            }
          : prev
      );

      if (status === "Delivered" && updated.orderId) {
        try {
          await put(`${ENDPOINTS.DRIVER_WALLET}/${updated.orderId}`, {});
        } catch (e) {
          showAlert("error", "Driver wallet update failed");
        }
      }

      showAlert("success", "Order updated");
    } catch (e) {
      showAlert("error", "Error updating order");
    } finally {
      setStatusUpdating(false);
      setDriverUpdating(false);
    }
  };

  const handleInvoiceDownload = async (orderId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}${ENDPOINTS.INVOICE}/${orderId}`, {
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

  const activeOrders = activeTab === "all" ? orders : tempOrders;

  const filteredOrders = activeOrders.filter((order) => {
    const search = searchTerm.toLowerCase();

    return (
      order.orderId?.toLowerCase().includes(search) ||
      order.items?.[0]?.name?.toLowerCase().includes(search) ||
      order.addressId?.fullAddress?.toLowerCase().includes(search) ||
      order.paymentStatus?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + entriesToShow);

  const csvData = filteredOrders.map((order, index) => ({
    No: startIndex + index + 1,
    OrderID: order.orderId,
    Item: order.items?.[0]?.name || "-",
    Address: order.addressId?.fullAddress || "-",
    Driver:
      order.driver?.name ||
      drivers.find((d) => d.id === String(order.driver?.driverId || order.driverId))?.name ||
      "-",
    Store: order.storeId?.storeName || "-",
    PaymentStatus: order.cashOnDelivery ? "Cash" : `Online (${order.paymentStatus || "-"})`,
    Status: order.orderStatus || "-",
  }));

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;700&display=swap');
          .order-container {
            font-family: 'Urbanist', sans-serif;
            padding: 24px;
            background: white;
            min-height: 100vh;
            border-radius: 16px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.1);
            max-width: 1400px;
            margin: 0 auto;
          }
          .order-box {
            
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
            flex-wrap: wrap;
            gap: 20px;
          }
          .header h2 {
            font-size: 28px;
            font-weight: 700;
            color: #344767;
          }
          .header p {
            font-size: 16px;
            color: #7b809a;
            margin-top: 8px;
          }
          .controls-container {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: center;
            margin-bottom: 24px;
          }
          .control-item {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 160px;
            max-width: 240px;
          }
          .control-item label {
            font-size: 15px;
            font-weight: 600;
            color: #344767;
            white-space: nowrap;
          }
          .control-item select, .control-item input {
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #d2d6da;
            font-size: 14px;
            width: 100%;
            outline: none;
            transition: border-color 0.3s, box-shadow 0.3s;
            background: #fff;
          }
          .control-item select:focus, .control-item input:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
          }
          .search-input {
            border-radius: 24px;
            padding-left: 20px;
          }
          .table-container {
            overflow-x: auto;
            position: relative;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .orders-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
          }
          .header-cell {
            padding: 16px;
            font-size: 15px;
            font-weight: 600;
            background: #007bff;
            color: white;
            text-align: left;
            cursor: pointer;
            user-select: none;
            transition: background 0.3s;
          }
          .header-cell:hover {
            background: #0056b3;
          }
          .body-cell {
            padding: 16px;
            font-size: 14px;
            border-bottom: 1px solid #f0f2f5;
            color: #344767;
            transition: background 0.2s;
          }
          .orders-table tr:hover .body-cell {
            background: #f8f9fa;
          }
          .order-details-cell {
            min-width: 220px;
            overflow-wrap: break-word;
          }
          .address-cell {
            min-width: 180px;
            overflow-wrap: break-word;
          }
          .store-cell {
            min-width: 200px;
            overflow-wrap: break-word;
          }
          .order-id {
            background: #007bff;
            color: white;
            padding: 8px 16px;
            border-radius: 16px;
            display: inline-block;
            font-size: 13px;
            max-width: 140px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: transform 0.3s, background 0.3s;
            cursor: pointer;
          }
          .order-id:hover {
            background: #0056b3;
            transform: scale(1.05);
          }
          .item-link {
            color: #007bff;
            cursor: pointer;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
          }
          .item-link:hover {
            color: #0056b3;
            text-decoration: underline;
          }
          .view-button, .download-button {
            padding: 8px 16px;
            border-radius: 8px;
            border: none;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.3s, transform 0.2s;
          }
          .view-button:hover, .download-button:hover {
            background: #0056b3;
            transform: translateY(-1px);
          }
          .status-select, .driver-select {
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #d2d6da;
            font-size: 13px;
            width: 140px;
            transition: border-color 0.3s;
          }
          .status-select:focus, .driver-select:focus {
            border-color: #007bff;
            outline: none;
          }
          .payment-cash {
            color: #007bff;
            font-weight: 600;
          }
          .payment-online {
            color: #28a745;
            font-weight: 600;
          }
          .transaction-id {
            display: block;
            font-size: 12px;
            color: #007bff;
            font-weight: 600;
            margin-top: 4px;
          }
          .pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 24px;
            flex-wrap: wrap;
            gap: 16px;
          }
          .pagination button {
            padding: 10px 20px;
            border-radius: 10px;
            border: none;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s, transform 0.2s;
          }
          .pagination button:hover:not(:disabled) {
            background: #0056b3;
            transform: translateY(-1px);
          }
          .pagination button:disabled {
            background: #e0e0e0;
            cursor: not-allowed;
          }
          .modal-content {
            background: white;
            padding: 32px;
            border-radius: 16px;
            max-width: 900px;
            width: 90%;
            margin: 48px auto;
            position: relative;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            overflow: hidden;
          }
          .driver-modal-content {
            background: white;
            padding: 32px;
            border-radius: 16px;
            max-width: 400px;
            width: 90%;
            margin: 48px auto;
            position: relative;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            overflow: hidden;
            font-family: 'Urbanist', sans-serif;
          }
          .modal-table-container {
            overflow-y: auto;
            max-height: 400px;
            margin-bottom: 24px;
            -webkit-overflow-scrolling: touch;
          }
          .modal-table {
            width: 100%;
            border-collapse: collapse;
          }
          .modal-table th, .modal-table td {
            padding: 16px;
            border: 1px solid #d2d6da;
            font-size: 14px;
            text-align: left;
            vertical-align: middle;
          }
          .modal-table th {
            background: #007bff;
            color: white;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 1;
          }
          .modal-table td img {
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 6px;
            vertical-align: middle;
            margin-right: 12px;
          }
          .modal-table tbody tr:hover {
            background: #f8f9fa;
          }
          .modal-table tfoot td {
            font-weight: 600;
            background: #f8f9fa;
            position: sticky;
            bottom: 0;
            z-index: 1;
          }
          .address-modal-content {
            background: white;
            padding: 32px;
            border-radius: 16px;
            max-width: 600px;
            margin: 48px auto;
            position: relative;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            overflow: hidden;
            font-family: 'Urbanist', sans-serif;
          }
          .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            cursor: pointer;
            color: #344767;
            font-size: 20px;
            transition: color 0.3s;
          }
          .modal-close:hover {
            color: #007bff;
          }
          .address-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            border: 1px solid #d2d6da;
          }
          .address-field {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 15px;
            color: #344767;
          }
          .address-field-icon {
            color: #007bff;
            font-size: 20px;
            flex-shrink: 0;
          }
          .address-field-label {
            font-weight: 600;
            width: 120px;
            flex-shrink: 0;
          }
          .address-field-value {
            flex: 1;
            word-break: break-word;
            font-size: 14px;
          }
          .refresh-button, .export-button, .modal-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 10px;
            border: none;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            transition: background 0.3s, transform 0.2s;
          }
          .refresh-button:hover, .export-button:hover, .modal-button:hover {
            background: #0056b3;
            transform: translateY(-1px);
          }
          .modal-button.cancel {
            background: #dc3545;
          }
          .modal-button.cancel:hover {
            background: #c82333;
          }
          @media (max-width: 768px) {
            .order-container {
              padding: 16px;
            }
            .order-box {
              padding: 20px;
            }
            .controls-container {
              flex-direction: column;
              gap: 12px;
            }
            .control-item {
              width: 100%;
              max-width: none;
            }
            .modal-content, .address-modal-content, .driver-modal-content {
              margin: 24px;
              max-width: 95%;
              padding: 20px;
            }
            .modal-table-container {
              max-height: 300px;
            }
            .modal-table th, .modal-table td {
              padding: 12px;
              font-size: 13px;
            }
            .modal-table td img {
              width: 40px;
              height: 40px;
            }
            .orders-table {
              font-size: 13px;
            }
            .header-cell, .body-cell {
              padding: 12px;
            }
            .status-select, .driver-select {
              width: 120px;
              font-size: 12px;
            }
            .address-field {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
            .address-field-label {
              width: auto;
            }
            .order-details-cell, .address-cell, .store-cell {
              min-width: 140px;
            }
          }
        `}
      </style>
      <MDBox
        p={3}
        style={{
          marginLeft: isDashboard ? 0 : miniSidenav ? "90px" : "280px",
          transition: "margin-left 0.3s ease",
          position: "relative",
        }}
      >
        <div className="order-container">
          <div className="order-box">
            <div className="header">
              <div>
                {showHeader && (
                  <h2 style={{ marginBottom: "20px" }}>
                    {isDashboard ? "Recent Orders" : "Order Management"}
                  </h2>
                )}
                <p style={{ fontSize: "16px", color: "#7b809a", marginTop: "8px" }}>
                  View and manage all orders
                </p>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <button className="refresh-button" onClick={fetchData}>
                  Refresh
                </button>
                <CSVLink data={csvData} filename={"orders.csv"} className="export-button">
                  Export CSV
                </CSVLink>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <button
                className="refresh-button"
                style={{
                  background: activeTab === "all" ? "#007bff" : "#e0e0e0",
                  color: activeTab === "all" ? "#fff" : "#344767",
                }}
                onClick={() => setActiveTab("all")}
              >
                All Orders
              </button>

              <button
                className="refresh-button"
                style={{
                  background: activeTab === "temp" ? "#007bff" : "#e0e0e0",
                  color: activeTab === "temp" ? "#fff" : "#344767",
                }}
                onClick={() => setActiveTab("temp")}
              >
                Failed Orders
              </button>
            </div>

            <div className="controls-container">
              {!isDashboard && (
                <div className="control-item">
                  <label>Show Entries</label>
                  <select
                    value={entriesToShow}
                    onChange={(e) => {
                      setEntriesToShow(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>
              )}

              <div className="control-item">
                <label>Store</label>
                <select
                  value={selectedStore}
                  onChange={(e) => {
                    setSelectedStore(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-item">
                <label>Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Zones</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-item">
                <label>Status</label>
                {activeTab === "temp" ? (
                  <span style={{ color: "#dc3545", fontWeight: 600 }}>Failed Payment</span>
                ) : (
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Statuses</option>
                    {deliveryStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="control-item">
                <label>Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Order ID, Item, Address, Status..."
                  className="search-input"
                />
              </div>
            </div>

            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th
                      className="header-cell"
                      onClick={() => handleSort("index")}
                      style={{ width: "80px" }}
                    >
                      Sr No{" "}
                      {sortConfig.key === "index" &&
                        (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th
                      className="header-cell"
                      onClick={() => handleSort("orderId")}
                      style={{ width: "120px" }}
                    >
                      Order ID{" "}
                      {sortConfig.key === "orderId" &&
                        (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th
                      className="header-cell"
                      onClick={() => handleSort("items[0].name")}
                      style={{ width: "220px" }}
                    >
                      Order Details{" "}
                      {sortConfig.key === "items[0].name" &&
                        (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th
                      className="header-cell"
                      onClick={() => handleSort("addressId.fullAddress")}
                      style={{ width: "200px" }}
                    >
                      Fullname/Address{" "}
                      {sortConfig.key === "addressId.fullAddress" &&
                        (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th className="header-cell" style={{ width: "160px" }}>
                      Driver
                    </th>
                    <th
                      className="header-cell"
                      onClick={() => handleSort("storeId.storeName")}
                      style={{ width: "200px" }}
                    >
                      Store{" "}
                      {sortConfig.key === "storeId.storeName" &&
                        (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                    <th className="header-cell" style={{ width: "120px" }}>
                      Invoice
                    </th>
                    <th className="header-cell" style={{ width: "160px" }}>
                      Payment Status
                    </th>
                    <th
                      className="header-cell"
                      onClick={() => handleSort("orderStatus")}
                      style={{ width: "140px" }}
                    >
                      Status{" "}
                      {sortConfig.key === "orderStatus" &&
                        (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order, index) => {
                      const item = order.items?.[0];
                      const store = stores.find(
                        (s) => s.id === (order.storeId?._id?.$oid || order.storeId?._id)
                      );
                      const variant = variants[
                        order.items?.[0]?.productId?.$oid || item?.productId
                      ]?.find(
                        (v) =>
                          (v._id?.$oid || v._id) ===
                          (order.items?.[0]?.varientId?.$oid || order.items?.[0]?.varientId)
                      );
                      return (
                        <tr key={order.orderId}>
                          <td className="body-cell">{startIndex + index + 1}</td>
                          <td className="body-cell">
                            <span className="order-id" title={order.orderId}>
                              {order.orderId}
                            </span>
                          </td>
                          <td className="body-cell order-details-cell">
                            <span
                              className="item-link"
                              onClick={() => setSelectedOrder(order)}
                              style={{ display: "block", fontWeight: 500 }}
                            >
                              ₹{order.totalPrice?.toFixed(2) || 0}
                            </span>
                            <span style={{ color: "#7b809a", fontSize: "13px" }}>
                              Quantity: {item?.quantity || 0}
                            </span>
                          </td>
                          <td className="body-cell address-cell">
                            <span
                              className="item-link"
                              onClick={() => setSelectedAddress(order.addressId)}
                              title={order.addressId?.fullAddress}
                            >
                              {order.addressId?.fullName
                                ? order.addressId.fullName.length > 20
                                  ? `${order.addressId.fullName.substring(0, 20)}...`
                                  : order.addressId.fullName
                                : "-"}
                            </span>
                            <span
                              style={{
                                display: "block",
                                color: "#7b809a",
                                fontSize: "12px",
                                marginTop: "4px",
                              }}
                            >
                              {order.addressId?.fullAddress
                                ? order.addressId.fullAddress.length > 25
                                  ? `${order.addressId.fullAddress.substring(0, 25)}...`
                                  : order.addressId.fullAddress
                                : "-"}
                            </span>
                          </td>
                          <td className="body-cell">
                            <select
                              className="driver-select"
                              value={order.driver?.driverId || order.driverId || ""}
                              onChange={(e) =>
                                handleOrderUpdate(order._id, undefined, e.target.value)
                              }
                              disabled={activeTab === "temp" || driverUpdating || !drivers.length}
                            >
                              <option value="">Unassigned</option>
                              {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="body-cell store-cell">
                            {order.storeId?.storeName
                              ? `${order.storeId.storeName} (${
                                  store?.zones.map((z) => z.title).join(", ") || "Unknown"
                                })`
                              : "-"}
                          </td>
                          <td className="body-cell">
                            <button
                              className="download-button"
                              onClick={() => handleInvoiceDownload(order.orderId)}
                            >
                              Download
                            </button>
                          </td>
                          <td className="body-cell">
                            <span className={`payment-${order.cashOnDelivery ? "cash" : "online"}`}>
                              {order.cashOnDelivery
                                ? "Cash"
                                : `Online (${order.paymentStatus || "-"})`}
                            </span>
                            {!order.cashOnDelivery && order.transactionId && (
                              <span className="transaction-id">Txn ID: {order.transactionId}</span>
                            )}
                          </td>
                          <td className="body-cell">
                            {activeTab === "temp" ? (
                              <span style={{ color: "#dc3545", fontWeight: 600 }}>Canceled</span>
                            ) : (
                              <select
                                className="status-select"
                                value={order.orderStatus || ""}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                disabled={statusUpdating || !deliveryStatuses.length}
                              >
                                {deliveryStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="body-cell"
                        style={{ textAlign: "center", color: "#7b809a", fontSize: "14px" }}
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
                <span style={{ fontSize: "14px", color: "#7b809a" }}>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + entriesToShow, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </span>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
          <div className="modal-content">
            <span className="modal-close" onClick={() => setSelectedOrder(null)}>
              ×
            </span>
            {selectedOrder && (
              <>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#344767",
                    marginBottom: "24px",
                  }}
                >
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
                            <td style={{ fontSize: "14px", padding: "16px" }}>
                              {item.quantity || 0}
                            </td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>
                              <img
                                src={`${process.env.REACT_APP_IMAGE_LINK}${item.image}`}
                                alt={item.name}
                                style={{
                                  width: 48,
                                  height: 48,
                                  objectFit: "cover",
                                  marginRight: 12,
                                }}
                              />
                              <span className="item-link" title={item.name}>
                                {item.name || "-"}
                              </span>
                            </td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>{item.sku || ""}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>
                              {item.variantName || "-"}
                            </td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>₹{price}</td>
                            <td style={{ fontSize: "14px", padding: "16px" }}>₹{subtotal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            padding: "16px",
                            fontSize: "14px",
                          }}
                        >
                          Subtotal (Incl. GST):
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>
                          ₹
                          {selectedOrder.items.reduce(
                            (sum, item) => sum + item.quantity * (item.price || 0),
                            0
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            padding: "16px",
                            fontSize: "14px",
                          }}
                        >
                          GST Breakdown ({selectedOrder.items[0]?.gst || "0%"}):
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>
                          ₹
                          {selectedOrder.items
                            .reduce((sum, item) => {
                              const price = item.quantity * (item.variantPrice || item.price || 0);
                              const gstRate = parseFloat(item.gst || "0") / 100;
                              return sum + price * gstRate;
                            }, 0)
                            .toFixed(2)}{" "}
                          <br />
                          <small style={{ color: "#7b809a", fontSize: "12px" }}>
                            (Already included in prices)
                          </small>
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            padding: "16px",
                            fontSize: "14px",
                          }}
                        >
                          Delivery Charges:
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>
                          ₹{selectedOrder.deliveryCharges || 0}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            padding: "16px",
                            fontSize: "14px",
                          }}
                        >
                          Platform Fee(%):
                        </td>
                        <td style={{ fontSize: "14px", padding: "16px" }}>
                          {selectedOrder.platformFee || 0}
                        </td>
                      </tr>
                      <tr style={{ borderTop: "2px solid #d2d6da" }}>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            padding: "16px",
                            fontSize: "15px",
                          }}
                        >
                          Total Payable Amount:
                        </td>
                        <td style={{ fontSize: "15px", padding: "16px" }}>
                          ₹
                          {selectedOrder.totalPrice?.toFixed(2) ||
                            (
                              selectedOrder.items.reduce((sum, item) => {
                                const price =
                                  item.quantity * (item.variantPrice || item.price || 0);
                                return sum + price;
                              }, 0) +
                              (selectedOrder.deliveryCharges || 0) +
                              (selectedOrder.platformFee || 0)
                            ).toFixed(2)}
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

        <Modal open={!!selectedAddress} onClose={() => setSelectedAddress(null)}>
          <div className="address-modal-content">
            <span className="modal-close" onClick={() => setSelectedAddress(null)}>
              ×
            </span>
            {selectedAddress && (
              <>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#344767",
                    marginBottom: "24px",
                  }}
                >
                  Address Details
                </h3>
                <div className="address-card">
                  <div className="address-field">
                    <FaUser className="address-field-icon" />
                    <span className="address-field-label">Full Name</span>
                    <span className="address-field-value">{selectedAddress.fullName || "-"}</span>
                  </div>
                  <div className="address-field">
                    <FaMapMarkerAlt className="address-field-icon" />
                    <span className="address-field-label">Address</span>
                    <span className="address-field-value">
                      {selectedAddress.fullAddress || "-"}
                    </span>
                  </div>
                  <div className="address-field">
                    <FaPhoneAlt className="address-field-icon" />
                    <span className="address-field-label">Mobile Number</span>
                    <span className="address-field-value">
                      {selectedAddress.moibleNumber || "-"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>

        <Modal open={showDriverModal} onClose={() => setShowDriverModal(false)}>
          <div className="driver-modal-content">
            <span className="modal-close" onClick={() => setShowDriverModal(false)}>
              ×
            </span>
            <h3
              style={{ fontWeight: 700, fontSize: "24px", color: "#344767", marginBottom: "24px" }}
            >
              Select Delivery Driver
            </h3>
            <p style={{ fontSize: "14px", color: "#7b809a", marginBottom: "16px" }}>
              A driver must be assigned to change the status to {pendingStatus}.
            </p>
            <div className="control-item" style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "15px", fontWeight: 600, color: "#344767" }}>Driver</label>
              <select
                className="driver-select"
                onChange={(e) => handleDriverSelection(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a driver
                </option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
              <button className="modal-button cancel" onClick={() => setShowDriverModal(false)}>
                Cancel
              </button>
              <button
                className="modal-button"
                onClick={() => handleDriverSelection("")}
                disabled={!drivers.length}
              >
                Not Now
              </button>
            </div>
          </div>
        </Modal>
      </MDBox>
    </>
  );
};

export default Orders;
