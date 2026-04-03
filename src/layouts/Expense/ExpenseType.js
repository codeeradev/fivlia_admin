import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { Button, Modal, Box, TextField } from "@mui/material";
import { showAlert } from "components/commonFunction/alertsLoader";
import DataTable from "react-data-table-component";
import { get, post, put } from "api/apiClient"; // axios wrapper
import { ENDPOINTS } from "api/endPoints";

function ExpenseTypeList() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [types, setTypes] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [editId, setEditId] = useState(null); // <-- for editing condition

  // Fetch types on load
  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const fetchExpenseTypes = async () => {
    try {
      const res = await get(ENDPOINTS.GET_EXPENSE_TYPE);
      const data = res.data;
      setTypes(data.expenseType || []);
    } catch (err) {
      showAlert("error", "Failed to load expense types");
    }
  };

  const handleOpenAdd = () => {
    setEditId(null); // ADD mode
    setNewTitle(""); // clear input
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditId(item._id); // EDIT mode
    setNewTitle(item.title); // prefill title
    setOpenModal(true);
  };

  // ADD / EDIT Logic (same API)
  const saveExpenseType = async () => {
    if (!newTitle.trim()) return showAlert("warning", "Title is required");

    try {
      showAlert("loading", editId ? "Updating expense type..." : "Adding expense type...");

      const url = editId
        ? `${ENDPOINTS.ADD_EXPENSE_TYPE}?id=${editId}`
        : ENDPOINTS.ADD_EXPENSE_TYPE;

      await post(url, { title: newTitle }, { authRequired: true });

      
      showAlert("success", editId ? "Expense Type Updated" : "Expense Type Added");

      setOpenModal(false);
      setNewTitle("");
      setEditId(null);

      fetchExpenseTypes();
    } catch (err) {
      // showAlert("error", "Something went wrong");
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
      {/* Main Container */}
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
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Expense Type</h2>

          <Button
            onClick={handleOpenAdd}
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 180,
              fontSize: 14,
              color: "white",
            }}
          >
            + ADD EXPENSE TYPE
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={[
            {
              name: "Sr. No",
              selector: (row, index) => index + 1,
              width: "100px",
              sortable: true,
            },
            {
              name: "Title",
              selector: (row) => row.title,
              sortable: true,
              wrap: true,
            },
            {
              name: "Created",
              selector: (row) => new Date(row.createdAt).toLocaleDateString(),
              sortable: true,
              width: "160px",
            },
            {
              name: "Action",
              cell: (row) => (
                <Button
                  variant="contained"
                  size="small"
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: 13,
                  }}
                  onClick={() => handleOpenEdit(row)}
                >
                  Edit
                </Button>
              ),
              ignoreRowClick: true,
              allowOverflow: true,
              button: true,
            },
          ]}
          data={types}
          pagination
          highlightOnHover
          fixedHeader
          fixedHeaderScrollHeight="450px"
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#007bff",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
              },
            },
            rows: {
              style: {
                fontSize: "15px",
              },
            },
          }}
        />
      </div>

      {/* Modal (Same for ADD + EDIT) */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: 400,
            background: "white",
            padding: 4,
            borderRadius: 4,
            boxShadow: 24,
            margin: "120px auto",
          }}
        >
          <h3 style={{ marginTop: 0, textAlign: "center" }}>
            {editId ? "Edit Expense Type" : "Add Expense Type"}
          </h3>

          <TextField
            fullWidth
            label="Expense Type Title"
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Button
            onClick={saveExpenseType}
            fullWidth
            style={{
              marginTop: 20,
              backgroundColor: "#007bff",
              color: "white",
              height: 45,
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            {editId ? "Update" : "Save"}
          </Button>
        </Box>
      </Modal>
    </MDBox>
  );
}

export default ExpenseTypeList;

// Styles
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
  textAlign: "center",
};
