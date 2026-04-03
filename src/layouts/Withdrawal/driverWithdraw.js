import React, { useEffect, useState } from "react";
import { useMaterialUIController } from "context";
import MDBox from "components/MDBox";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

export default function DriversWithdrawal() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const openModal = (request) => {
    setSelectedRequest(request);
    setNote("");
    setImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setNote("");
    setImage(null);
    setLoadingAction(null);
    setIsModalOpen(false);
  };

  const headerCell = {
    padding: "14px 12px",
    border: "1px solid #ddd",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#007bff",
    color: "white",
  };

  const bodyCell = {
    padding: "12px",
    border: "1px solid #eee",
    fontSize: 17,
    backgroundColor: "#fff",
  };

  const getDisplayValue = (value) => {
    if (value === undefined || value === null || value === "") {
      return "";
    }
    return value;
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleString() : "");

  const fetchWithdrawalRequests = async () => {
    try {
      showAlert("loading", "Loading Requests....");
      const response = await get(ENDPOINTS.GET_WITHDRAWAL_REQUESTS);
      const data = response.data;

      if (Array.isArray(data.requests)) {
        const formattedRequests = data.requests.map((request) => ({
          id: request._id,
          driverId: request.driverId,
          displayDriverId: request.driverDetails?.driverId || "",
          driverName: request.driverDetails?.driverName || "",
          amount: request.amount,
          type: request.type,
          description: request.description || request.Note || "",
          status: request.status,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          driverDetails: request.driverDetails || null,
        }));
        setWithdrawalRequests(formattedRequests);
        showAlert("info", "", 1);
      } else {
        showAlert("error", "Invalid withdrawal requests data format");
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      showAlert("error", "Failed to fetch withdrawal requests. Please try again.");
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const handleWithdrawalAction = async (request, action) => {
    const trimmedNote = note.trim();
    const requestTargetId = request?.driverId || request?.id;

    if (!requestTargetId) {
      showAlert("error", "Unable to identify this withdrawal request.");
      return;
    }

    try {
      setLoadingAction(action);
      showAlert("loading", `${action === "accept" ? "Approving" : "Declining"} request...`);

      const formData = new FormData();
      if (trimmedNote) formData.append("note", trimmedNote);
      if (image) formData.append("image", image);

      const response = await put(
        `${ENDPOINTS.WITHDRAWAL_ACTION}/${requestTargetId}/${action}`,
        formData
      );
      const updatedRequest = response.data?.request;
      const updatedStatus = updatedRequest?.status || (action === "accept" ? "Accepted" : "Declined");

      setWithdrawalRequests((prev) =>
        prev.map((req) =>
          req.id === request?.id || req.driverId === request?.driverId
            ? {
                ...req,
                status: updatedStatus,
                description: updatedRequest?.description || trimmedNote || req.description,
              }
            : req
        )
      );
      showAlert(
        "success",
        `Withdrawal request ${action === "accept" ? "approved" : "declined"} successfully.`
      );
      closeModal();
      await fetchWithdrawalRequests();
    } catch (error) {
      console.error(`Error ${action}ing withdrawal request:`, error);
      showAlert(
        "error",
        error.response?.data?.message || `Failed to ${action} withdrawal request: ${error.message}`
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredRequests = withdrawalRequests.filter((req) => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    return (
      (req.displayDriverId || "").toLowerCase().includes(normalizedSearchTerm) ||
      (req.driverName || "").toLowerCase().includes(normalizedSearchTerm)
    );
  });

  const totalPages = Math.ceil(filteredRequests.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Withdrawal Requests</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              View and manage all withdrawal requests
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 17 }}>Show Entries </label>
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
              {[5, 10, 20, 30].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <label style={{ fontSize: 17, marginRight: 8 }}>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by Driver ID or Name..."
              style={{
                padding: "8px 34px",
                borderRadius: "8px",
                height: "42px",
                width: "220px",
                border: "1px solid #ccc",
                fontSize: 16,
                outline: "none",
              }}
            />
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: '"Urbanist", sans-serif',
            fontSize: "17px",
            border: "1px solid #007BFF",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={headerCell}>Sr No</th>
              <th style={headerCell}>Driver ID</th>
              <th style={headerCell}>Driver Name</th>
              <th style={headerCell}>Amount</th>
              <th style={headerCell}>Type</th>
              <th style={headerCell}>Description</th>
              <th style={headerCell}>Status</th>
              <th style={headerCell}>Created At</th>
              <th style={headerCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length > 0 ? (
              currentRequests.map((request, index) => (
                <tr key={request.id}>
                  <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + index + 1}</td>
                  <td style={bodyCell}>{getDisplayValue(request.displayDriverId)}</td>
                  <td style={bodyCell}>{getDisplayValue(request.driverName)}</td>
                  <td style={bodyCell}>Rs. {getDisplayValue(request.amount)}</td>
                  <td style={bodyCell}>{getDisplayValue(request.type)}</td>
                  <td style={bodyCell}>{getDisplayValue(request.description)}</td>
                  <td style={bodyCell}>{getDisplayValue(request.status)}</td>
                  <td style={bodyCell}>{formatDate(request.createdAt)}</td>
                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    <button
                      onClick={() => openModal(request)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                        backgroundColor: "#007BFF",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                  No withdrawal requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            Showing {filteredRequests.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of{" "}
            {filteredRequests.length} entries
          </div>
          <div>
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === 1 ? "#ccc" : "#007BFF",
                color: currentPage === 1 ? "#666" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                marginRight: "8px",
              }}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === totalPages ? "#ccc" : "#007BFF",
                color: currentPage === totalPages ? "#666" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
              padding: "30px 25px",
              boxShadow: "0px 5px 20px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 15, color: "#007BFF" }}>Driver Withdrawal Details</h2>

            <div style={{ marginBottom: 15, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Driver Details</h3>
              <p><strong>Driver ID:</strong> {getDisplayValue(selectedRequest.displayDriverId)}</p>
              <p><strong>Name:</strong> {getDisplayValue(selectedRequest.driverDetails?.driverName)}</p>
              <p><strong>Phone:</strong> {getDisplayValue(selectedRequest.driverDetails?.phoneNumber)}</p>
              <p><strong>Email:</strong> {getDisplayValue(selectedRequest.driverDetails?.email)}</p>
              <p><strong>City:</strong> {getDisplayValue(selectedRequest.driverDetails?.city)}</p>
              <p><strong>Locality:</strong> {getDisplayValue(selectedRequest.driverDetails?.locality)}</p>
              <p><strong>Image:</strong> {getDisplayValue(selectedRequest.driverDetails?.image)}</p>
            </div>

            <div style={{ marginBottom: 15, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Bank & Payment Details</h3>
              <p><strong>Bank Name:</strong> {getDisplayValue(selectedRequest.driverDetails?.bankDetails?.bankName)}</p>
              <p><strong>Account Holder:</strong> {getDisplayValue(selectedRequest.driverDetails?.bankDetails?.accountHolder)}</p>
              <p><strong>Account Number:</strong> {getDisplayValue(selectedRequest.driverDetails?.bankDetails?.accountNumber)}</p>
              <p><strong>IFSC Code:</strong> {getDisplayValue(selectedRequest.driverDetails?.bankDetails?.ifsc)}</p>
              <p><strong>Branch:</strong> {getDisplayValue(selectedRequest.driverDetails?.bankDetails?.branch)}</p>
              <p><strong>UPI ID:</strong> {getDisplayValue(selectedRequest.driverDetails?.upiId)}</p>
            </div>

            <div style={{ marginBottom: 15, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Withdrawal Request Details</h3>
              <p><strong>Current Wallet Balance:</strong> {getDisplayValue(selectedRequest.driverDetails?.wallet)}</p>
              <p><strong>Requested Amount:</strong> Rs. {getDisplayValue(selectedRequest.amount)}</p>
              <p><strong>Type:</strong> {getDisplayValue(selectedRequest.type)}</p>
              <p><strong>Status:</strong> {getDisplayValue(selectedRequest.status)}</p>
              <p><strong>Description:</strong> {getDisplayValue(selectedRequest.description)}</p>
              <p><strong>Created At:</strong> {formatDate(selectedRequest.createdAt)}</p>
              <p><strong>Updated At:</strong> {formatDate(selectedRequest.updatedAt)}</p>
            </div>

            {selectedRequest.status === "Pending" && (
              <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10 }}>
                <textarea
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 15,
                    resize: "vertical",
                  }}
                />

                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  style={{ padding: 5 }}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => handleWithdrawalAction(selectedRequest, "accept")}
                    disabled={loadingAction === "accept" || loadingAction === "decline"}
                    style={{
                      flex: 1,
                      padding: 10,
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: loadingAction ? "not-allowed" : "pointer",
                      opacity: loadingAction ? 0.7 : 1,
                    }}
                  >
                    {loadingAction === "accept" ? "Processing..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleWithdrawalAction(selectedRequest, "decline")}
                    disabled={loadingAction === "accept" || loadingAction === "decline"}
                    style={{
                      flex: 1,
                      padding: 10,
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: loadingAction ? "not-allowed" : "pointer",
                      opacity: loadingAction ? 0.7 : 1,
                    }}
                  >
                    {loadingAction === "decline" ? "Processing..." : "Decline"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 22,
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </MDBox>
  );
}
