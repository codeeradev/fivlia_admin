import React, { useEffect, useState } from "react";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import MDBox from "components/MDBox";
import { showAlert } from "components/commonFunction/alertsLoader"
import { ENDPOINTS } from "api/endPoints";
import { get } from "api/apiClient";
import { put } from "api/apiClient";

export default function SellerWithdrawal() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const dispatch = useDispatch();

  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // "accept" | "decline" | null

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setSelectedRequest(null);
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

  // Fetch withdrawal requests
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        showAlert("loading", "Fetching seller withdrawal requests...");
        const response = await get(`${ENDPOINTS.GET_WITHDRAWAL_REQUESTS}?type=seller`);
        const data = await response.data;
        if (Array.isArray(data.requests)) {
          const formattedRequests = data.requests.map((request) => ({
            id: request._id,
            storeId: request.storeId,
            amount: request.amount,
            type: request.type,
            description: request.description,
            status: request.status,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            sellerDetails: request.sellerDetails
          }));
          setWithdrawalRequests(formattedRequests);
          showAlert("success", "Requests loaded successfully!", 1200);
        } else {
          showAlert("error", "Invalid withdrawal requests data format.");
        }
      } catch (error) {
        console.error("Failed to fetch withdrawal requests:", error);
        showAlert("error", error.message || "Failed to fetch withdrawal requests.");
      }
    };

    fetchWithdrawalRequests();
  }, [dispatch]);


const handleWithdrawalAction = async (requestId, action) => {
  try {
    setLoadingAction(action);
    showAlert("loading", `${action === "accept" ? "Approving" : "Declining"} request...`);
    const formData = new FormData();
    if (note && note.trim() !== "") formData.append("note", note);
    if (image) formData.append("image", image);

    const response = await put(`${ENDPOINTS.WITHDRAWAL_ACTION}/${requestId}/${action}?type=seller`, formData);

    const updatedRequest = response.data;

    setWithdrawalRequests((prev) =>
      prev.map((req) =>
        req.storeId === requestId ? { ...req, status: updatedRequest.request.status } : req
      )
    );
    showAlert(
        "success",
        `Withdrawal request ${action === "accept" ? "approved" : "declined"} successfully!`
      );

    setNote("");
    setImage(null);
    closeModal();
  } catch (error) {
    console.error(`Error ${action}ing withdrawal request:`, error);
    showAlert("error", `Failed to ${action} withdrawal request: ${error.message}`);
  } finally {
   setLoadingAction(null); 
  }
};

  const filteredRequests = withdrawalRequests.filter((req) =>
    req.storeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value));
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
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Seller Withdrawal Requests</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              View and manage all seller withdrawal requests
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
              placeholder="Search by Seller ID..."
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
              <th style={headerCell}>Seller ID</th>
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
                  <td style={bodyCell}>{request.storeId}</td>
                  <td style={bodyCell}>₹{request.amount}</td>
                  <td style={bodyCell}>{request.type}</td>
                  <td style={bodyCell}>{request.description}</td>
                  <td style={bodyCell}>{request.status}</td>
                  <td style={bodyCell}>{new Date(request.createdAt).toLocaleString()}</td>
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
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No withdrawal requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of{" "}
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
            <h2 style={{ marginBottom: 15, color: "#007BFF" }}>Seller Withdrawal Details</h2>

            {/* Seller Info */}
            <div style={{ marginBottom: 15, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Seller Details</h3>
              <p><strong>Name:</strong> {selectedRequest.sellerDetails?.ownerName}</p>
              <p><strong>Store:</strong> {selectedRequest.sellerDetails?.storeName}</p>
              <p><strong>Phone:</strong> {selectedRequest.sellerDetails?.phoneNumber}</p>
              <p><strong>Email:</strong> {selectedRequest.sellerDetails?.email}</p>
              <p><strong>City:</strong> {selectedRequest.sellerDetails?.city?.name}</p>
              <p><strong>Address:</strong> {selectedRequest.sellerDetails?.fullAddress}</p>
            </div>

            {/* GST & Wallet */}
            <div style={{ marginBottom: 15, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Bank & Payment Details</h3>
              <p><strong>Branch Name:</strong> {selectedRequest.sellerDetails?.bankDetails?.bankName}</p>
              <p><strong>Account Holder Name:</strong> {selectedRequest.sellerDetails?.bankDetails.accountHolder}</p>
              <p><strong>Account Number:</strong> {selectedRequest.sellerDetails?.bankDetails.accountNumber}</p>
              <p><strong>IFSC Code:</strong> {selectedRequest.sellerDetails?.bankDetails?.ifsc}</p>
            </div>

            <div style={{ marginBottom: 15, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <h3 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Withdrawal Request Details</h3>
              <p><strong>Current Wallet Balance:</strong> {selectedRequest.sellerDetails?.wallet}</p>
              <p><strong>Requested Amount:</strong> ₹{selectedRequest?.amount}</p>
            
            </div>
            {/* Accept / Decline */}
            {selectedRequest.status === "Pending" && (
              <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {/* Optional Note */}
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
            
                {/* Optional Proof Document */}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={{ padding: 5 }}
                />
            
                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => handleWithdrawalAction(selectedRequest.storeId, "accept")}
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
                    onClick={() => handleWithdrawalAction(selectedRequest.storeId, "decline")}
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
            <button onClick={closeModal} style={{ position: "absolute", top: 10, right: 10, fontSize: 22, border: "none", background: "transparent", cursor: "pointer" }}>&times;</button>
          </div>
        </div>
      )}

    </MDBox>
  );
}
