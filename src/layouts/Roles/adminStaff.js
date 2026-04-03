// StaffMembers.js
import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
} from "@mui/material";
import DataTable from "react-data-table-component";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, post, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

function StaffMembers() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const [editId, setEditId] = useState(null);

  // fetch on mount
  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await get(ENDPOINTS.GET_STAFF);
      const data = res.data;
      // API might return array directly or wrapped - handle both
      setStaff(Array.isArray(data) ? data : data.staff || data.staffs || []);
    } catch (err) {
      showAlert("error", "Failed to load staff");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await get(ENDPOINTS.GET_ROLES);
      const data = res.data;
      // handle different payload shapes (Roles / roles)
      const list = data.Roles || data.roles || data.roleList || [];
      setRoles(list);
    } catch (err) {
      showAlert("error", "Failed to load roles");
    }
  };

  // open add modal
  const openAddModal = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId("");
    setOpenModal(true);
  };

  // open edit modal - prefills values
  const openEditModal = (item) => {
    setEditId(item._id);
    setName(item.name || "");
    setEmail(item.email || "");
    // don't prefill password for security - leave empty
    setPassword("");
    // item.roleId may be populated object or just id
    setRoleId(item.roleId?._id || item.roleId || "");
    setOpenModal(true);
  };

  // save (add or update)
  const saveStaff = async () => {
    if (!name.trim()) return showAlert("warning", "Name is required");
    if (!email.trim()) return showAlert("warning", "Email is required");
    if (!roleId) return showAlert("warning", "Select role");

    // When adding password required; when editing, password optional
    if (!editId && !password.trim()) return showAlert("warning", "Password is required");

    try {
      showAlert("loading", editId ? "Updating staff..." : "Adding staff...");

      const url = editId
        ? ENDPOINTS.EDIT_STAFF(editId)
        : ENDPOINTS.ADD_STAFF

      // For edit: only send password if entered
      const body = { name, email, roleId };
      if (password.trim()) body.password = password;

      const apiCall = editId ? put : post;

      await apiCall(url, body, { authRequired: true });

      showAlert("success", editId ? "Staff updated" : "Staff added");
      setOpenModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setRoleId("");
      setEditId(null);
      fetchStaff();
    } catch (err) {
      // showAlert("error", err.response?.data?.message || "Something went wrong");
    }
  };

  // optional: simple local delete helper if you later add API
  const handleDelete = async (id) => {
    // You don't have delete API in backend right now. If you add it later:
    // try {
    //   showAlert("loading", "Deleting staff...");
    //   const res = await fetch(`${process.env.REACT_APP_API_URL}/deleteStaff/${id}`, { method: "DELETE" });
    //   const data = await res.json();
    //   if (!res.ok) throw new Error(data.message);
    //   showAlert("success", "Staff deleted");
    //   fetchStaff();
    // } catch (err) {
    //   showAlert("error", "Failed to delete");
    // }
    showAlert("warning", "Delete API not implemented on backend");
  };

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
          backgroundColor: "#fafafa",
          overflowX: "auto",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Staff Members</h2>

          <Button
            onClick={openAddModal}
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 160,
              color: "white",
            }}
          >
            + ADD STAFF
          </Button>
        </div>

        {/* table */}
        <DataTable
          columns={[
            {
              name: "Sr No",
              selector: (row, i) => i + 1,
              width: "90px",
            },
            {
              name: "Name",
              selector: (row) => row.name,
              sortable: true,
              wrap: true,
            },
            {
              name: "Email",
              selector: (row) => row.email,
              sortable: true,
            },
            {
              name: "Role",
              selector: (row) =>
                // role may be populated object with field `roles` or plain id
                row.roleId?.roles || row.roleId?.name || (row.roleId || "-"),
              sortable: true,
            },
            {
              name: "Created",
              selector: (row) => new Date(row.createdAt).toLocaleDateString(),
              width: "140px",
            },
            {
              name: "Action",
              cell: (row) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="contained"
                    size="small"
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      borderRadius: 6,
                    }}
                    onClick={() => openEditModal(row)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    style={{
                      color: "#d32f2f",
                      borderColor: "#d32f2f",
                      borderRadius: 6,
                    }}
                    onClick={() => handleDelete(row._id)}
                  >
                    Delete
                  </Button>
                </div>
              ),
              ignoreRowClick: true,
              allowOverflow: true,
              button: true,
            },
          ]}
          data={staff}
          pagination
          fixedHeader
          fixedHeaderScrollHeight="520px"
          highlightOnHover
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#007bff",
                color: "white",
                fontWeight: "bold",
              },
            },
            rows: {
              style: {
                fontSize: 14,
              },
            },
          }}
        />
      </div>

      {/* modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: 520,
            background: "white",
            padding: 4,
            borderRadius: 4,
            boxShadow: 24,
            margin: "60px auto",
          }}
        >
          <h3 style={{ textAlign: "center", marginTop: 0 }}>
            {editId ? "Edit Staff" : "Add Staff"}
          </h3>

          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label={editId ? "Password (leave blank to keep current)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            sx={{ mt: 2 }}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={roleId}
              label="Role"
              onChange={(e) => setRoleId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {roles.map((r) => (
                <MenuItem key={r._id || r.id} value={r._id || r.id}>
                  {r.roles || r.name || r.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={saveStaff}
            fullWidth
            style={{
              marginTop: 20,
              backgroundColor: "#007bff",
              color: "white",
              height: 45,
              fontWeight: "bold",
            }}
          >
            {editId ? "Update Staff" : "Save Staff"}
          </Button>
        </Box>
      </Modal>
    </MDBox>
  );
}

export default StaffMembers;
