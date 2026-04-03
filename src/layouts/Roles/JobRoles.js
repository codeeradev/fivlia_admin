import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { Button, Modal, Box, TextField, FormControlLabel, Checkbox } from "@mui/material";
import DataTable from "react-data-table-component";
import { showAlert } from "components/commonFunction/alertsLoader";
import PermissionViewer from "components/RoleBaseFunction/PermissionViewer";
import PERMISSION_LIST from "components/RoleBaseFunction/permissonList";
import { get, post, put, del } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

function JobRoles() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [roles, setRoles] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [editId, setEditId] = useState(null);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await get(ENDPOINTS.GET_ROLES);
      const data = res.data;
      setRoles(data.roles || []);
    } catch (err) {
      showAlert("error", "Failed to load roles");
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditId(null);
    setRoleName("");
    setSelectedPermissions([]);
    setOpenModal(true);
  };

  // Open Edit Modal
  const openEditModal = (role) => {
    setEditId(role._id);
    setRoleName(role.roles);
    setSelectedPermissions(role.permissions || []);
    setOpenModal(true);
  };

  // Select ALL permissions
  const selectAll = () => {
    const all = Object.values(PERMISSION_LIST).flat();
    setSelectedPermissions(all);
  };

  // Unselect ALL permissions
  const unselectAll = () => {
    setSelectedPermissions([]);
  };

  // Check if ALL permissions selected
  const isAllSelected = () => {
    const total = Object.values(PERMISSION_LIST).flat().length;
    return selectedPermissions.length === total;
  };

  // Toggle permissions checkboxes
  const togglePermission = (perm) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  // Save Role (Add / Update)
  const saveRole = async () => {
    if (!roleName.trim()) return showAlert("warning", "Role title is required");

    try {
      showAlert("loading", editId ? "Updating Role..." : "Creating Role...");

      const url = editId ? `${ENDPOINTS.ADD_ROLE}?id=${editId}` : ENDPOINTS.ADD_ROLE;

      await post(url, { roles: roleName, permissions: selectedPermissions });

      showAlert("success", editId ? "Role Updated" : "Role Created");

      setOpenModal(false);
      setRoleName("");
      setSelectedPermissions([]);
      setEditId(null);

      fetchRoles();
    } catch (err) {
      showAlert("error", "Something went wrong");
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
      {/* Main container */}
      <div
        style={{
          borderRadius: 15,
          padding: 20,
          backgroundColor: "#fafafa",
          overflowX: "auto",
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
          <h2 style={{ margin: 0 }}>Job Roles</h2>

          <Button
            onClick={openAddModal}
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 150,
              color: "white",
            }}
          >
            + ADD ROLE
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={[
            {
              name: "Sr No",
              selector: (row, index) => index + 1,
              width: "100px",
            },
            {
              name: "Role",
              selector: (row) => row.roles,
              sortable: true,
            },
            {
              name: "Permissions",
              cell: (row) => <PermissionViewer permissions={row.permissions} />,
              wrap: true,
            },
            {
              name: "Created",
              selector: (row) => new Date(row.createdAt).toLocaleDateString(),
              width: "150px",
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
                    borderRadius: 6,
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
          data={roles}
          pagination
          fixedHeader
          fixedHeaderScrollHeight="450px"
          highlightOnHover
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#007bff",
                color: "white",
                fontWeight: "bold",
              },
            },
          }}
        />
      </div>

      {/* Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: 500,
            background: "white",
            padding: 4,
            borderRadius: 4,
            boxShadow: 24,
            margin: "50px auto",
          }}
        >
          <h3 style={{ textAlign: "center", marginTop: 0 }}>{editId ? "Edit Role" : "Add Role"}</h3>

          {/* Role Name */}
          <TextField
            fullWidth
            label="Role Title"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Permissions */}
          <h4 style={{ marginTop: 20 }}>Permissions</h4>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllSelected()}
                onChange={() => (isAllSelected() ? unselectAll() : selectAll())}
              />
            }
            label="Select All Permissions"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              maxHeight: 220,
              overflowY: "auto",
              padding: "10px",
              border: "1px solid #eee",
              borderRadius: 8,
            }}
          >
            {Object.entries(PERMISSION_LIST).map(([group, perms]) => (
              <div key={group} style={{ marginBottom: 15 }}>
                <strong style={{ fontSize: "14px" }}>{group}</strong>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 5,
                  }}
                >
                  {perms.map((perm) => (
                    <FormControlLabel
                      key={perm}
                      control={
                        <Checkbox
                          checked={selectedPermissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                        />
                      }
                      label={perm.replace(/_/g, " ")}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <Button
            onClick={saveRole}
            fullWidth
            style={{
              marginTop: 20,
              backgroundColor: "#007bff",
              color: "white",
              height: 45,
              fontWeight: "bold",
            }}
          >
            {editId ? "Update Role" : "Save Role"}
          </Button>
        </Box>
      </Modal>
    </MDBox>
  );
}

export default JobRoles;
