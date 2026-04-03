import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";
import { Button } from "@mui/material";

export default function FranchiseEnquiries() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  /* ================= FETCH DATA ================= */
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      showAlert("loading", "Loading franchise enquiries...");
      const res = await get(ENDPOINTS.GET_FRANCHISE_ENQUIRY);
      setData(res.data || []);
      showAlert("success", "Franchise enquiries loaded");
    } catch (err) {
      showAlert("error", "Failed to load franchise enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  /* ================= COLUMNS ================= */
  const columns = [
    {
      name: "Sr. No",
      width: "90px",
      cell: (_, index) => index + 1,
    },
    {
      name: "Name",
      selector: (row) => row.fullName,
      sortable: true,
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      wrap: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
    },
    {
      name: "State",
      selector: (row) => row.state || "-",
    },
    {
      name: "City",
      selector: (row) => row.city || "-",
    },
    {
      name: "Investment Interest",
      cell: (row) => (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            maxWidth: "260px", // important for table cell
          }}
        >
          {row.franchiseInvestment && (
            <span style={badge("#e3f2fd", "#1976d2")}>Franchise (₹10 Lacs / Zone)</span>
          )}

          {row.investWithUs && <span style={badge("#e8f5e9", "#00c853")}>18% Annual Return</span>}

          {!row.franchiseInvestment && !row.investWithUs && "—"}
        </div>
      ),
      wrap: true,
    },
    {
      name: "Created On",
      selector: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <Button
          variant="contained"
          size="small"
          style={{
            background: "#1976d2",
            color: "#fff",
            borderRadius: 6,
            padding: "4px 12px",
          }}
          onClick={() => setSelected(row)}
        >
          View
        </Button>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  /* ================= SEARCH ================= */
  const filteredData = data.filter((item) =>
    `${item.fullName} ${item.email} ${item.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      {/* ================= CONTAINER ================= */}
      <div
        style={{
          background: "#fafafa",
          padding: 20,
          borderRadius: 15,
        }}
      >
        {/* ================= HEADER ================= */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>Franchise Enquiries</h2>

          <input
            type="text"
            placeholder="Search name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 280,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 15,
            }}
          />
        </div>

        {/* ================= TABLE ================= */}
        <DataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          pagination
          highlightOnHover
          pointerOnHover
          fixedHeader
          fixedHeaderScrollHeight="500px"
          customStyles={tableStyles}
        />
      </div>

      {/* ================= MODAL ================= */}
      {selected && (
        <div onClick={() => setSelected(null)} style={modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={modalBox}>
            <h3 style={{ marginTop: 0, color: "#1976d2" }}>Franchise Enquiry Details</h3>

            <p>
              <strong>Name:</strong> {selected.fullName}
            </p>
            <p>
              <strong>Email:</strong> {selected.email}
            </p>
            <p>
              <strong>Phone:</strong> {selected.phone}
            </p>
            <p>
              <strong>State:</strong> {selected.state || "-"}
            </p>
            <p>
              <strong>City:</strong> {selected.city || "-"}
            </p>

            <p style={{ marginTop: 10 }}>
              <strong>Message:</strong>
              <br />
              {selected.message || "-"}
            </p>

            <p style={{ marginTop: 10 }}>
              <strong>Interested In:</strong>
              <br />
              {selected.franchiseInvestment && "• Franchise (₹10 Lacs per zone)"}
              <br />
              {selected.investWithUs && "• Invest with us for 18% annual return"}
            </p>

            <Button
              fullWidth
              style={{
                marginTop: 20,
                backgroundColor: "#007bff",
                color: "#fff",
                height: 42,
              }}
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </MDBox>
  );
}

/* ================= STYLES ================= */

const badge = (bg, color) => ({
  background: bg,
  color: color,
  padding: "6px 10px",
  borderRadius: 16,
  fontSize: 12,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "normal", // ✅ allow wrapping
  wordBreak: "break-word", // ✅ break long text
  lineHeight: 1.3,
  maxWidth: "100%", // ✅ respect cell width
});

const tableStyles = {
  headCells: {
    style: {
      backgroundColor: "#007bff",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "15px",
    },
  },
  rows: {
    style: {
      fontSize: "15px",
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  },
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalBox = {
  background: "#fff",
  padding: 25,
  borderRadius: 12,
  width: "90%",
  maxWidth: 550,
};
