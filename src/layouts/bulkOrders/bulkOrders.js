import React, { useEffect, useState } from "react";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import { get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";
import MDBox from "components/MDBox";
import { put } from "api/apiClient";

export default function BulkOrders() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === Fetch Bulk Orders ===
    const fetchOrders = async () => {
      try {
        showAlert("loading", "Loading bulk orders...");

        const res = await get(ENDPOINTS.GET_BULK_ORDERS);
        const data = res.data;

        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          showAlert("success", "Bulk orders loaded");
        } else {
          setError("Invalid response format from server.");
          showAlert("error", "Invalid response from server");
        }
      } catch (err) {
        console.error("Failed to fetch bulk orders:", err);
        setError("Failed to fetch bulk orders. Please try again later.");
        showAlert("error", "Failed to fetch bulk orders");
      }
    };
  useEffect(() => {
    fetchOrders();
  }, [dispatch]);

  const updateStatus = async (status) => {
    try {
      showAlert("loading", "Updating status...");

      const res = await put(`${ENDPOINTS.UPDATE_BULK_ORDERS}/${selectedOrder._id}`, { status });

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === selectedOrder._id ? { ...o, status: res.data.data.status } : o))
      );

      if (selectedOrder?._id === selectedOrder._id) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }

      showAlert("success", `Order ${status}`);
      closeModal();
      fetchOrders();
    } catch (e) {
      showAlert("error", "Failed to update status");
      closeModal();
    }
  };

  // === Filtering and Pagination ===
  const filteredOrders = orders.filter((order) => {
    const userName = order.user?.name?.toLowerCase() || "";
    const productTitle = order.product?.title?.toLowerCase() || "";
    return (
      userName.includes(searchTerm.toLowerCase()) || productTitle.includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // === Handlers ===
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // === UI Styles ===
  const headerCell = {
    padding: "14px 12px",
    border: "1px solid #ddd",
    fontSize: 17,
    fontWeight: "bold",
    backgroundColor: "#0d6efd",
    color: "white",
  };

  const bodyCell = {
    padding: "12px",
    border: "1px solid #eee",
    fontSize: 16,
    backgroundColor: "#fff",
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#ffc107";
      case "completed":
        return "#28a745";
      case "rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={3} sx={{ marginTop: "30px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        {/* === Header === */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#0d6efd",
                borderBottom: "3px solid #0d6efd",
                display: "inline-block",
                paddingBottom: "5px",
              }}
            >
              Bulk Orders
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: "17px", color: "#555" }}>
              Manage all customer bulk order requests
            </p>
          </div>
        </div>

        {/* === Filter Controls === */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "15px",
          }}
        >
          <div>
            <label style={{ fontSize: 16, marginRight: 6 }}>Show</label>
            <select
              value={entriesToShow}
              onChange={handleEntriesChange}
              style={{
                fontSize: 16,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="🔍 Search by user or product..."
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                height: "42px",
                width: "280px",
                border: "1px solid #ccc",
                fontSize: 16,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* === Table === */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: '"Inter", sans-serif',
              fontSize: "16px",
            }}
          >
            <thead>
              <tr>
                <th style={headerCell}>#</th>
                <th style={headerCell}>Image</th>
                <th style={headerCell}>Product</th>
                <th style={headerCell}>User</th>
                <th style={headerCell}>Price</th>
                <th style={headerCell}>Status</th>
                <th style={headerCell}>Date</th>
                <th style={headerCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    style={{
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + index + 1}</td>
                    <td style={bodyCell}>
                      {order.product?.image && (
                        <img
                          src={`${process.env.REACT_APP_IMAGE_LINK}${order.product.image}`}
                          alt={order.product.title}
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "8px",
                            marginLeft: "10px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>{order.product?.title || "N/A"}</span>
                      </div>
                    </td>
                    <td style={bodyCell}>
                      {order.user?.name || "Guest User"} <br />
                      <small style={{ color: "#777" }}>{order.user?.mobileNumber || "N/A"}</small>
                    </td>
                    <td style={bodyCell}>₹{order.product?.price ?? "—"}</td>
                    <td style={bodyCell}>
                      <span
                        style={{
                          backgroundColor: getStatusColor(order.status),
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td style={bodyCell}>{new Date(order.createdAt).toLocaleString()}</td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <button
                        onClick={() => openModal(order)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          backgroundColor: "#0d6efd",
                          color: "#fff",
                          border: "none",
                          fontWeight: "500",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0b5ed7")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0d6efd")}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "25px" }}>
                    No bulk orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* === Pagination === */}
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of{" "}
            {filteredOrders.length} entries
          </div>
          <div>
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === 1 ? "#ccc" : "#0d6efd",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                marginRight: "8px",
              }}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === totalPages ? "#ccc" : "#0d6efd",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* === Modal === */}
      {isModalOpen && selectedOrder && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              width: "90%",
              maxWidth: "650px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "25px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.3s ease",
              scrollbarWidth: "thin",
              scrollbarColor: "#ccc #f9f9f9",
            }}
          >
            <h2 style={{ color: "#0d6efd", marginBottom: 20 }}>📦 Bulk Order Details</h2>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <section style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <h4>User Information</h4>
                <p>
                  <strong>Name:</strong> {selectedOrder.user?.name || "Guest"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.user?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.user?.mobileNumber || "N/A"}
                </p>
              </section>

              <section style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <h4>Product Information</h4>
                <p>
                  <strong>Title:</strong> {selectedOrder.product?.title}
                </p>
                <p>
                  <strong>Slug:</strong> {selectedOrder.product?.slug}
                </p>
                <p>
                  <strong>Price:</strong> ₹{selectedOrder.product?.price}
                </p>
                {selectedOrder.product?.image && (
                  <img
                    src={`${process.env.REACT_APP_IMAGE_LINK}${selectedOrder.product.image}`}
                    alt={selectedOrder.product.title}
                    style={{
                      width: "100%",
                      maxHeight: "260px",
                      borderRadius: 8,
                      objectFit: "cover",
                      marginTop: "10px",
                    }}
                  />
                )}
              </section>

              <section>
                <h4>Order Details</h4>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      backgroundColor: getStatusColor(selectedOrder.status),
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
                <p>
                  <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </section>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: 25 }}>
              <button
                disabled={selectedOrder.status === "completed" || selectedOrder.status === "rejected"}
                onClick={() => updateStatus("completed")}
                style={{
                  flex: 1,
                  backgroundColor: selectedOrder.status === "rejected" || selectedOrder.status === "completed" ? "#ccc" : "#28a745",
                  color: "#fff",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: selectedOrder.status === "rejected" || selectedOrder.status === "completed" ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Complete
              </button>

              <button
                disabled={selectedOrder.status === "completed" || selectedOrder.status === "rejected"}
                onClick={() => updateStatus("rejected")}
                style={{
                  flex: 1,
                  backgroundColor: selectedOrder.status === "rejected" || selectedOrder.status === "completed" ? "#ccc" : "#dc3545",
                  color: "#fff",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: selectedOrder.status === "rejected" || selectedOrder.status === "completed" ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Reject
              </button>

              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  backgroundColor: "#0d6efd",
                  color: "#fff",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MDBox>
  );
}
