import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Modal,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DataTable from "react-data-table-component";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, post, put } from "api/apiClient";   // axios wrapper
import { ENDPOINTS } from "api/endPoints";


function Expenses() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [expenses, setExpenses] = useState([]);
  const [types, setTypes] = useState([]);

  // Modal Fields
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchExpenses();
    fetchTypes();
  }, []);

  // Fetch Expense Types
  const fetchTypes = async () => {
    try {
      const res = await get(ENDPOINTS.GET_EXPENSE_TYPE);
      const data = res.data;
      setTypes(data.expenseType || []);
    } catch (err) {
      showAlert("error", "Failed to load expense types");
    }
  };

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const res = await get(ENDPOINTS.GET_EXPENSES);
      const data = res.data
      setExpenses(data.expenses || []);
    } catch (err) {
      showAlert("error", "Failed to load expenses");
    }
  };

  // Open ADD modal
  const openAddModal = () => {
    setEditId(null);
    setTitle("");
    setType("");
    setAmount("");
    setFromDate("");
    setToDate("");
    setOpenModal(true);
  };

  // Open EDIT modal
  const openEditModal = (exp) => {
    setEditId(exp._id);
    setTitle(exp.title);
    setType(exp.type);
    setAmount(exp.amount);
    setFromDate(exp.date?.from?.split("T")[0] || "");
    setToDate(exp.date?.to?.split("T")[0] || "");
    setOpenModal(true);
  };

  // Save/Add or Edit Expense
  const saveExpense = async () => {
    if (!title.trim()) return showAlert("warning", "Title is required");
    if (!type) return showAlert("warning", "Select expense type");
    if (!amount || isNaN(amount)) return showAlert("warning", "Amount must be a number");
    if (!fromDate || !toDate) return showAlert("warning", "Select date range");

    const payload = {
      title,
      type,
      amount: Number(amount),
      date: { from: fromDate, to: toDate },
    };

    try {
      showAlert("loading", editId ? "Updating expense..." : "Adding expense...");

      if (editId) {
        showAlert("loading", "Updating expense...");
        await put(ENDPOINTS.EDIT_EXPENSES(editId), payload, { authRequired: true });
        showAlert("success", "Expense updated successfully");
      } else {
        showAlert("loading", "Adding expense...");
        await post(ENDPOINTS.ADD_EXPENSES, payload, { authRequired: true });
        showAlert("success", "Expense added successfully");
      }

      showAlert("success", editId ? "Expense Updated" : "Expense Added");
      setOpenModal(false);

      fetchExpenses();
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
          <h2 style={{ margin: 0 }}>Expenses</h2>

          <Button
            onClick={openAddModal}
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 150,
              fontSize: 14,
              color: "white",
            }}
          >
            + ADD EXPENSE
          </Button>
        </div>

        {/* Table */}
        {/* Scrollable Table Container */}
        {/* DataTable */}
        <DataTable
          columns={[
            {
              name: "Sr. No",
              selector: (row, index) => index + 1,
              width: "90px",
              sortable: true,
            },
            {
              name: "Title",
              selector: (row) => row.title,
              sortable: true,
              wrap: true,
            },
            {
              name: "Type",
              selector: (row) => row.type?.title || "-",
              sortable: true,
            },
            {
              name: "Amount (₹)",
              selector: (row) => `₹ ${row.amount}`,
              sortable: true,
            },
            {
              name: "From",
              selector: (row) => row.date.from,
            },
            {
              name: "To",
              selector: (row) => row.date.to,
            },
            {
              name: "Created",
              selector: (row) => new Date(row.createdAt).toLocaleDateString(),
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
                    color: "white",
                    borderRadius: 6,
                    padding: "4px 12px",
                  }}
                  onClick={() => openEditModal(row)}
                >
                  Edit
                </Button>
              ),
              ignoreRowClick: true,
              allowOverflow: true,
              button: true,
            },
          ]}
          data={expenses}
          pagination
          highlightOnHover
          pointerOnHover
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
                paddingTop: "10px",
                paddingBottom: "10px",
              },
            },
          }}
        />
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: 450,
            background: "white",
            padding: 4,
            borderRadius: 4,
            boxShadow: 24,
            margin: "120px auto",
          }}
        >
          <h3 style={{ marginTop: 0, textAlign: "center" }}>
            {editId ? "Edit Expense" : "Add Expense"}
          </h3>

          {/* Expense Title */}
          <TextField
            fullWidth
            label="Expense Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Amount */}
          <TextField
            fullWidth
            label="Amount (₹)"
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            sx={{ mt: 2 }}
          />

          {/* Expense Type */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Expense Type</InputLabel>
            <Select
              value={type}
              label="Expense Type"
              onChange={(e) => setType(e.target.value)}
              sx={{
                borderRadius: "8px",
                height: "40px",
              }}
            >
              {types.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dates */}
          <TextField
            fullWidth
            type="date"
            label="From Date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            type="date"
            label="To Date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Save / Update */}
          <Button
            fullWidth
            style={{
              marginTop: 20,
              backgroundColor: "#007bff",
              color: "white",
              height: 45,
              fontWeight: "bold",
            }}
            onClick={saveExpense}
          >
            {editId ? "Update Expense" : "Save Expense"}
          </Button>
        </Box>
      </Modal>
    </MDBox>
  );
}

export default Expenses;

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
