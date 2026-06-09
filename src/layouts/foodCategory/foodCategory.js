import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";

import {
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";

import DataTable from "react-data-table-component";

import { showAlert } from "components/commonFunction/alertsLoader";
import { get, post, del } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function FoodTypes() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [foodTypes, setFoodTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedFoodType, setSelectedFoodType] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [foodTypeData, setFoodTypeData] = useState({
    name: "",
    description: "",
    image: null,
    filter: [],
    filterInput: "",
    commission: 0,
    status: true,
  });

  // ================= FETCH =================

  const fetchFoodTypes = async () => {
    try {
      showAlert("loading", "Fetching food types...");

      const response = await get(ENDPOINTS.GET_FOOD);

      const data = response.data;

      setFoodTypes(data || []);

      showAlert("info", "", 1);
    } catch (error) {
      console.log(error);
      showAlert("error", "Failed to fetch food types");
    }
  };

  useEffect(() => {
    fetchFoodTypes();
  }, []);

  // ================= ADD =================

  const handleAddFoodType = async () => {
    try {
      const formData = new FormData();

      formData.append("name", foodTypeData.name);
      formData.append("description", foodTypeData.description);
      formData.append("status", foodTypeData.status);
      formData.append("filter", JSON.stringify(foodTypeData.filter));
      formData.append("commission", foodTypeData.commission);
      if (foodTypeData.image) {
        formData.append("image", foodTypeData.image);
      }

      showAlert("loading", "Adding food type...");

      const response = await post(ENDPOINTS.ADD_FOOD, formData);

      showAlert(
        "success",
        response?.data?.message || "Food type added successfully",
      );

      setAddModalOpen(false);

      setFoodTypeData({
        name: "",
        description: "",
        image: null,
        status: true,
        filter: [],
        commission: 0,
        filterInput: "",
      });

      fetchFoodTypes();
    } catch (error) {
      console.log(error);
      showAlert("error", "Failed to add food type");
    }
  };

  // ================= EDIT =================

  const handleOpenEditModal = (row) => {
    setSelectedFoodType(row);

    setFoodTypeData({
      name: row.name || "",
      description: row.description || "",
      image: null,
      status: row.status ?? true,
      commission: row.commission || 0,
      filter: row.filter || [],
      filterInput: "",
    });

    setEditModalOpen(true);
  };

  const handleEditFoodType = async () => {
    try {
      const formData = new FormData();

      formData.append("name", foodTypeData.name);
      formData.append("description", foodTypeData.description);
      formData.append("status", foodTypeData.status);
      formData.append("commission", foodTypeData.commission);
      formData.append("filter", JSON.stringify(foodTypeData.filter));
      if (foodTypeData.image) {
        formData.append("image", foodTypeData.image);
      }

      showAlert("loading", "Updating food type...");

      const response = await post(
        ENDPOINTS.UPDATE_FOOD.replace(":id", selectedFoodType._id),
        formData,
      );

      showAlert(
        "success",
        response?.data?.message || "Food type updated successfully",
      );

      setEditModalOpen(false);

      fetchFoodTypes();
    } catch (error) {
      console.log(error);
      showAlert("error", "Failed to update food type");
    }
  };

  // ================= DELETE =================

  const handleDeleteFoodType = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this food type?",
      );

      if (!confirmDelete) return;

      showAlert("loading", "Deleting food type...");

      const response = await del(ENDPOINTS.DELETE_FOOD.replace(":id", id));

      showAlert(
        "success",
        response?.data?.message || "Food type deleted successfully",
      );

      fetchFoodTypes();
    } catch (error) {
      console.log(error);
      showAlert("error", "Failed to delete food type");
    }
  };

  // ================= STATUS =================

  const handleToggleStatus = async (row) => {
    try {
      const formData = new FormData();

      formData.append("status", !row.status);

      await post(ENDPOINTS.UPDATE_FOOD.replace(":id", row._id), formData);

      fetchFoodTypes();
    } catch (error) {
      console.log(error);
      showAlert("error", "Failed to update status");
    }
  };

  // ================= TABLE =================

  const columns = [
    {
      name: "Image",
      cell: (row) =>
        row.image ? (
          <Avatar
            src={`${process.env.REACT_APP_IMAGE_LINK}${row.image}`}
            sx={{
              width: 45,
              height: 45,
            }}
          />
        ) : (
          "-"
        ),
    },

    {
      name: "Food Type",
      selector: (row) => row.name,
      sortable: true,
    },

    {
      name: "Description",
      selector: (row) => row.description || "-",
      sortable: true,
    },

    {
      name: "Commission",
      selector: (row) => `${row.commission || 0}%`,
      sortable: true,
    },

    {
      name: "Status",
      cell: (row) => (
        <Switch
          checked={row.status ?? true}
          onChange={() => handleToggleStatus(row)}
        />
      ),
    },

    {
      name: "Action",
      cell: (row) => (
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <Button
            sx={{ backgroundColor: "#007BFF", color: "#fff", marginRight: 1 }}
            onClick={() => handleOpenEditModal(row)}
          >
            Edit
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteFoodType(row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredFoodTypes = foodTypes.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <MDBox
      sx={{
        ml: {
          xs: 0,
          sm: miniSidenav ? "80px" : "250px",
        },
        mt: "30px",
        p: 2,
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h2>Food Types</h2>
          <p>Manage all food types</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search food type..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setFoodTypeData({
                name: "",
                description: "",
                image: null,
                filter: [],
                filterInput: "",
                status: true,
                commission: 0,
              });

              setAddModalOpen(true);
            }}
          >
            + Add Food Type
          </Button>
        </div>
      </div>

      {/* TABLE */}

      <DataTable
        columns={columns}
        data={filteredFoodTypes}
        pagination
        highlightOnHover
        responsive
      />

      {/* ================= ADD MODAL ================= */}

      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Food Type</DialogTitle>

        <DialogContent>
          <TextField
            label="Food Type Name"
            fullWidth
            margin="normal"
            value={foodTypeData.name}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                name: e.target.value,
              })
            }
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={foodTypeData.description}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                description: e.target.value,
              })
            }
          />

          <TextField
            label="Commission (%)"
            type="number"
            fullWidth
            margin="normal"
            value={foodTypeData.commission}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                commission: Number(e.target.value),
              })
            }
          />

          <TextField
            label="Add Filter"
            fullWidth
            margin="normal"
            value={foodTypeData.filterInput}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                filterInput: e.target.value,
              })
            }
          />

          <Button
            variant="contained"
            sx={{ mt: 1, color: "white !important" }}
            onClick={() => {
              if (!foodTypeData.filterInput.trim()) return;

              setFoodTypeData({
                ...foodTypeData,
                filter: [...foodTypeData.filter, foodTypeData.filterInput],
                filterInput: "",
              });
            }}
          >
            Add Filter
          </Button>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            {foodTypeData.filter?.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#eee",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {item}

                <span
                  style={{
                    cursor: "pointer",
                    color: "red",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setFoodTypeData({
                      ...foodTypeData,
                      filter: foodTypeData.filter.filter((_, i) => i !== index),
                    });
                  }}
                >
                  ×
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2, color: "blue" }}
          >
            {foodTypeData.image?.name || "Upload Image"}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFoodTypeData({
                  ...foodTypeData,
                  image: e.target.files[0],
                })
              }
            />
          </Button>

          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Switch
                checked={foodTypeData.status}
                onChange={(e) =>
                  setFoodTypeData({
                    ...foodTypeData,
                    status: e.target.checked,
                  })
                }
              />
            }
            label="Active Status"
          />
        </DialogContent>

        <DialogActions>
          <Button color="error" onClick={() => setAddModalOpen(false)}>
            Cancel
          </Button>

          <Button color="primary" onClick={handleAddFoodType}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= EDIT MODAL ================= */}

      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Food Type</DialogTitle>

        <DialogContent>
          <TextField
            label="Food Type Name"
            fullWidth
            margin="normal"
            value={foodTypeData.name}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                name: e.target.value,
              })
            }
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={foodTypeData.description}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                description: e.target.value,
              })
            }
          />

          <TextField
            label="Commission (%)"
            type="number"
            fullWidth
            margin="normal"
            value={foodTypeData.commission}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                commission: Number(e.target.value),
              })
            }
          />

          <TextField
            label="Add Filter"
            fullWidth
            margin="normal"
            value={foodTypeData.filterInput}
            onChange={(e) =>
              setFoodTypeData({
                ...foodTypeData,
                filterInput: e.target.value,
              })
            }
          />

          <Button
            variant="contained"
            sx={{ mt: 1, color: "white !important" }}
            onClick={() => {
              if (!foodTypeData.filterInput.trim()) return;

              setFoodTypeData({
                ...foodTypeData,
                filter: [...foodTypeData.filter, foodTypeData.filterInput],
                filterInput: "",
              });
            }}
          >
            Add Filter
          </Button>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            {foodTypeData.filter?.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#eee",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {item}

                <span
                  style={{
                    cursor: "pointer",
                    color: "red",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setFoodTypeData({
                      ...foodTypeData,
                      filter: foodTypeData.filter.filter((_, i) => i !== index),
                    });
                  }}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2, color: "blue" }}
          >
            {foodTypeData.image?.name || "Update Image"}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFoodTypeData({
                  ...foodTypeData,
                  image: e.target.files[0],
                })
              }
            />
          </Button>

          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Switch
                checked={foodTypeData.status}
                onChange={(e) =>
                  setFoodTypeData({
                    ...foodTypeData,
                    status: e.target.checked,
                  })
                }
              />
            }
            label="Active Status"
          />
        </DialogContent>

        <DialogActions>
          <Button color="error" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>

          <Button color="primary" onClick={handleEditFoodType}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
