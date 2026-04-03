import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button, Switch } from "@mui/material";
import { post, put } from "api/apiClient";
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

function Blog() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, entriesToShow]);

  const fetchBlogs = async () => {
    try {
      showAlert("loading", "Loading blogs...");

      const res = await post(
        `${ENDPOINTS.GET_BLOG_ADMIN}?type=admin&page=${currentPage}&limit=${entriesToShow}`
      );

      const data = res.data;

      setBlogs(data.blogs || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);

      showAlert("success", "Blogs loaded successfully");
    } catch (err) {
      console.error("Error fetching blogs:", err);
      showAlert("error", "Failed to load blog list");
    }
  };

  // ✅ Handle status toggle
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      showAlert("loading", "Updating status...");

      await put(`${ENDPOINTS.EDIT_BLOG}/${id}`, { status: newStatus });

      // Update locally without refetching all
      setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)));
      showAlert("success", "Status updated");
    } catch (err) {
      console.error("Error updating blog status:", err);
      showAlert("error", "Failed to update status");
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <div
        style={{
          borderRadius: 15,
          padding: 20,
          overflowX: "auto",
          backgroundColor: "#fafafa",
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
            <h2 style={{ margin: 0 }}>Blog List</h2>
            <p style={{ fontSize: 16, color: "#666" }}>View or edit blogs</p>
          </div>
          <Button
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 150,
              fontSize: 14,
              color: "white",
              letterSpacing: "1px",
            }}
            onClick={() => navigate("/add-blog")}
          >
            + ADD BLOG
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
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 16, marginRight: 10 }}>Show Entries</label>
            <select
              value={entriesToShow}
              onChange={(e) => {
                setEntriesToShow(Number(e.target.value));
                setCurrentPage(1);
              }}
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
              placeholder="Search Blog..."
              style={{
                padding: "8px 15px",
                borderRadius: "20px",
                height: "40px",
                width: "200px",
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr>
                <th style={headerCell}>Sr. No</th>
                <th style={headerCell}>Image</th>
                <th style={headerCell}>Title</th>
                <th style={headerCell}>Category</th>
                <th style={headerCell}>Date</th>
                <th style={headerCell}>Status</th>
                <th style={{ ...headerCell, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog, index) => (
                <tr key={blog._id}>
                  <td style={bodyCell}>{(currentPage - 1) * entriesToShow + index + 1}</td>
                  <td style={bodyCell}>
                    {blog.image ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_LINK}${blog.image}`}
                        alt={blog.statusTitle}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "6px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: "#999" }}>No image</span>
                    )}
                  </td>
                  <td style={bodyCell}>{blog.title}</td>
                  <td style={bodyCell}>{blog.category || "-"}</td>
                  <td style={bodyCell}>{new Date(blog.createdAt).toLocaleDateString()}</td>

                  {/* ✅ Toggle switch for status */}
                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    <Switch
                      checked={blog.status === "published"}
                      color="success"
                      onChange={() => handleStatusToggle(blog._id, blog.status)}
                    />
                    <span
                      style={{
                        color: blog.status === "published" ? "green" : "orange",
                        fontWeight: "bold",
                        marginLeft: 8,
                      }}
                    >
                      {blog.status || "draft"}
                    </span>
                  </td>

                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    <button
                      style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/add-blog", { state: blog })}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
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
            Showing {(currentPage - 1) * entriesToShow + 1}-
            {Math.min(currentPage * entriesToShow, totalCount)} of {totalCount} blogs
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
            <span style={{ margin: "0 10px" }}>
              Page {currentPage} of {totalPages}
            </span>
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
    </MDBox>
  );
}

export default Blog;
