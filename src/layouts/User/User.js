import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { get, put, del } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

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

function UserTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        showAlert("loading", "Fetching users…");
        const res = await get(ENDPOINTS.GET_USERS);
        setUsers(res.data || []);
        showAlert("success", "Users loaded");
      } catch (err) {
        console.error("Error fetching users:", err);
        showAlert("error", "Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + entriesToShow);

  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleBlockUnblock = async (id, currentStatus) => {
    try {
      const action = currentStatus ? "unblock" : "block";
      const confirmAction = window.confirm(`Are you sure you want to ${action} this user?`);
      if (!confirmAction) return;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${id}/${action}`, {
        method: "PUT",
      });

      if (res.status === 200) {
        setUsers((prev) =>
          prev.map((user) => (user._id === id ? { ...user, isBlocked: !currentStatus } : user))
        );
        alert(`User ${action}ed successfully!`);
      }
    } catch (err) {
      console.error(`Error ${currentStatus ? "unblocking" : "blocking"} user:`, err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) return;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${id}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        setUsers((prev) => prev.filter((user) => user._id !== id));
        alert("User deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <div className="user-container">
        <div
          style={{
            width: "100%",
            borderRadius: 15,
            padding: 20,
            overflowX: "auto",
          }}
        >
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
              <span style={{ fontWeight: "bold", fontSize: 26 }}>Users List</span>
              <br />
              <span style={{ fontSize: 17 }}>View and manage all users</span>
            </div>
            <div>
              <Button
                style={{
                  backgroundColor: "#00c853",
                  height: 45,
                  width: 150,
                  fontSize: 14,
                  color: "white",
                  letterSpacing: "1px",
                }}
                onClick={() => navigate("/user-create")}
              >
                + ADD USER
              </Button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>Show Entries</span> 
              <select
                value={entriesToShow}
                onChange={(e) => setEntriesToShow(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 16 }}>Search</label>
              <br />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search User..."
                style={{
                  padding: "5px",
                  borderRadius: "20px",
                  height: "40px",
                  width: "200px",
                  border: "1px solid #ccc",
                  fontSize: 17,
                  paddingLeft: "15px",
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                overflow: "hidden",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr>
                  <th style={headerCell}>Sr. No</th>
                  <th style={headerCell}>Mobile</th>
                  <th style={headerCell}>Name</th>
                  <th style={headerCell}>City/Zone</th>
                  <th style={headerCell}>Email</th>
                  <th style={headerCell}>Total Orders</th>
                  <th style={headerCell}>Wallet</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Block/Unblock</th>
                  <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((item, index) => (
                  <tr key={item._id}>
                    <td style={bodyCell}>{startIndex + index + 1}</td>
                    <td style={bodyCell}>{item.mobileNumber || item.phone || "-"}</td>
                    <td style={bodyCell}>{item.name || "-"}</td>
                    <td style={bodyCell}>
                      {item?.location?.city || "-"}/{item?.location?.zone || "-"}
                    </td>
                    <td style={bodyCell}>{item.email || "-"}</td>
                    <td style={bodyCell}>{item.totalOrders || 0}</td>
                    <td style={bodyCell}>₹{item.wallet || 0}</td>
                    <td style={{ ...bodyCell, textAlign: "center" }}>
                      <button
                        style={{
                          backgroundColor: item.isBlocked ? "#28a745" : "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleBlockUnblock(item._id, item.isBlocked)}
                      >
                        {item.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                    <td style={bodyCell}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button
                          style={{
                            backgroundColor: "#007BFF",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate("/edit-user", { state: item })}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleDeleteUser(item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span>
              Showing {startIndex + 1}-{Math.min(startIndex + entriesToShow, filteredUsers.length)}{" "}
              of {filteredUsers.length} users
            </span>
            <div>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 16px",
                  marginRight: 10,
                  borderRadius: 10,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default UserTable;
