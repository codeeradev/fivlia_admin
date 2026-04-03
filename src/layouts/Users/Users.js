import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

// Dummy Users
const dummyUsers = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    image: `https://randomuser.me/api/portraits/men/${i + 1}.jpg`,
    date: `2024-05-${(i + 10).toString().padStart(2, "0")}`,
    status: i % 2 === 0 ? "Active" : "Inactive",
    city: i % 2 === 0 ? "Delhi" : "Mumbai",
    zone: i % 3 === 0 ? "North" : "South",
}));

const headerCell = {
    padding: "14px 12px",
    border: "1px solid #ddd",
    fontSize: 18,
    textAlign: "left",
    fontWeight: "bold",
    backgroundColor: "#007bff",
    color: "white",
};

const bodyCell = {
    padding: "12px",
    border: "1px solid #eee",
    fontSize: 17,
};

function UserData() {
    const [controller] = useMaterialUIController();
    const { miniSidenav } = controller;
    const navigate=useNavigate();

    const [users, setUsers] = useState([]);
    const [entriesToShow, setEntriesToShow] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setUsers(dummyUsers);
    }, []);

    const filteredUsers = users.filter((user) => {
        const search = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.status.toLowerCase().includes(search) ||
            user.city.toLowerCase().includes(search) ||
            user.zone.toLowerCase().includes(search) ||
            user.date.includes(search)
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / entriesToShow);
    const startIndex = (currentPage - 1) * entriesToShow;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + entriesToShow);

    const handleEntriesChange = (e) => {
        setEntriesToShow(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    return (
        <MDBox
            p={{ xs: 1, sm: 1.5, md: 2 }}
            sx={{
                ml: { xs: 0, lg: miniSidenav ? "80px" : "250px" },
                transition: "margin-left 0.3s ease",
            }}
        >
            <div className="city-container" style={{ marginLeft: "10px", marginRight: "10px" }}>
                <div
                    
                    style={{
                        width: "100%",
                      
                        borderRadius: 15,
                        padding: 20,
                        
                        overflowX: "auto",
                    }}
                >
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
                            <span style={{ fontWeight: "bold", fontSize: 26 }}>User Lists</span>
                            <br />
                            <span style={{ fontSize: 17 }}>View and manage all users</span>
                        </div>
                        <Button
                            style={{
                                backgroundColor: "green",
                                height: 45,
                                width: 175,
                                fontSize: 15,
                                color: "white",
                                borderRadius: 20,
                                wordSpacing: 2,
                                letterSpacing: "1px",
                                borderColor: "white",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                         }} onClick={()=>navigate('/user-create')}
                        >
                            + Create User
                        </Button>
                    </div>

                    {/* Controls */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 10,
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ marginBottom: 10 }}>
                            <span style={{ fontSize: 16 }}>Show</span>&nbsp;
                            <select value={entriesToShow} onChange={handleEntriesChange}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            &nbsp;
                            <span style={{ fontSize: 16 }}>entries</span>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            Search:&nbsp;
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search..."
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

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                borderSpacing: 0,
                                overflow: "hidden",
                               
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={headerCell}>User Info</th>
                                    <th style={headerCell}>Email</th>
                                    <th style={headerCell}>City</th>
                                    <th style={headerCell}>Zone</th>
                                    <th style={headerCell}>Date</th>
                                    <th style={headerCell}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td style={bodyCell}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        style={{
                                                            width: 45,
                                                            height: 45,
                                                            borderRadius: "50%",
                                                            marginRight: 10,
                                                        }}
                                                    />
                                                    <span style={{ fontWeight: 500 }}>{user.name}</span>
                                                </div>
                                            </td>
                                            <td style={bodyCell}>{user.email}</td>
                                            <td style={bodyCell}>{user.city}</td>
                                            <td style={bodyCell}>{user.zone}</td>
                                            <td style={bodyCell}>{user.date}</td>
                                            <td style={bodyCell}>
                                                <span
                                                    style={{
                                                        padding: "6px 12px",
                                                        borderRadius: "20px",
                                                        backgroundColor:
                                                            user.status === "Active" ? "#d4edda" : "#f8d7da",
                                                        color:
                                                            user.status === "Active" ? "#155724" : "#721c24",
                                                        fontWeight: "bold",
                                                        fontSize: "15px",
                                                    }}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "20px", fontSize: 18 }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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
                            Showing {startIndex + 1}-
                            {Math.min(startIndex + entriesToShow, filteredUsers.length)} of{" "}
                            {filteredUsers.length} users
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

export default UserData;
