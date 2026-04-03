// NotificationsDataTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import DataTable from "react-data-table-component";
import { get, post, del, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";
import { getAllZones } from "components/commonApi/commonApi";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

/* ----------------------- Helpers ----------------------- */
const cleanMulti = (v) => (typeof v === "string" ? v.split(",") : v || []);
const mapCityNames = (cityIds = [], zones = []) =>
  !cityIds || cityIds.includes("all")
    ? ["All Cities"]
    : (cityIds || []).map((id) => zones.find((c) => c._id === id)?.city).filter(Boolean);
const mapZoneNames = (zoneIds = [], zones = [], cityIds = []) => {
  if (!zoneIds || zoneIds.includes("all")) return ["All Zones"];
  const list = [];
  (zoneIds || []).forEach((zid) =>
    (zones || []).forEach((city) =>
      (city.zones || []).forEach((zn) => {
        if (zn._id === zid && (cityIds?.includes("all") || cityIds?.includes(city._id)))
          list.push(zn.zoneTitle);
      })
    )
  );
  return list;
};
const toFormData = (data) => {
  const fd = new FormData();
  if (data.title) fd.append("title", data.title);
  if (data.description) fd.append("description", data.description);
  (Array.isArray(data.city) ? data.city : []).forEach((c) => fd.append("city", c));
  (Array.isArray(data.zone) ? data.zone : []).forEach((z) => fd.append("zone", z));
  if (data.sendType) fd.append("sendType", data.sendType);
  if (data.image) fd.append("image", data.image);
  return fd;
};
/* ----------------------- Component ----------------------- */

export default function NotificationsDataTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [zones, setZones] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: [],
    zone: [],
    sendType: "all",
    image: null,
  });

  const [perPage, setPerPage] = useState(5);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [modals, setModals] = useState({ add: false, edit: false, image: false, info: false });
  const [info, setInfo] = useState({ title: "", list: [] });

  // styles used earlier — moved to DataTable customStyles
  const customStyles = {
    headRow: { style: { backgroundColor: "#007bff" } },
    headCells: { style: { color: "white", fontWeight: "700", fontSize: "16px" } },
    rows: { style: { minHeight: "56px" } },
    cells: { style: { padding: "12px", fontSize: "15px" } },
  };

  // load zones
  useEffect(() => {
    (async () => {
      try {
        const z = await getAllZones();
        setZones(z?.data || []);
      } catch (e) {
        showAlert("error", "Failed to load zones");
      }
    })();
  }, []);

  // load notifications
  useEffect(() => {
    (async () => {
      try {
        showAlert("loading", "Loading notifications...");
        const res = await get(ENDPOINTS.GET_NOTIFICATION);
        const d = res.data;
        if (!Array.isArray(d.notifications)) throw new Error("Invalid notification format");
        const formatted = d.notifications.map((n) => ({
          id: n._id,
          title: n.title || "",
          description: n.description || "",
          city: Array.isArray(n.city) ? n.city : n.city ? [n.city] : [],
          zone: Array.isArray(n.zone) ? n.zone : n.zone ? [n.zone] : [],
          sendType: n.sendType || "",
          image: n.image || "",
          createdAt: n.createdAt || "",
        }));
        setNotifications(formatted);
        showAlert("success", "Notifications loaded");
      } catch (e) {
        showAlert("error", "Failed to load notifications");
      }
    })();
  }, []);

  /* ------------------ Actions ------------------ */
  const openInfo = (title, list) => {
    setInfo({ title, list });
    setModals((m) => ({ ...m, info: true }));
  };
  const openImage = (img) => {
    setSelected({ image: img });
    setModals((m) => ({ ...m, image: true }));
  };
  const closeImage = () => {
    setSelected(null);
    setModals((m) => ({ ...m, image: false }));
  };

  const openAdd = () => {
    setForm({ title: "", description: "", city: [], zone: [], sendType: "all", image: null });
    setModals((m) => ({ ...m, add: true }));
  };
  const openEdit = (row) => {
    setSelected(row);
    setForm({
      title: row.title || "",
      description: row.description || "",
      city: Array.isArray(row.city) ? row.city : row.city ? [row.city] : [],
      zone: Array.isArray(row.zone) ? row.zone : row.zone ? [row.zone] : [],
      sendType: row.sendType || "all",
      image: null,
    });
    setModals((m) => ({ ...m, edit: true }));
  };

  const sendNotification = async (n) => {
    try {
      showAlert("loading", "Sending notification...");
      await post(ENDPOINTS.SEND_NOTIFICATION, {
        title: n.title,
        description: n.description,
        sendType: n.sendType,
        city: n.city,
        zone: n.zone,
      });
      showAlert("success", "Notification sent successfully");
    } catch (e) {
      showAlert("error", e.response?.data?.message || "Failed to send notification");
    }
  };

  const addNotification = async () => {
    try {
      showAlert("loading", "Adding notification...");
      const fd = toFormData(form);
      const res = await post(ENDPOINTS.ADD_NOTIFICATION, fd);
      const n = res.data.notification;
      setNotifications((p) => [
        ...p,
        {
          id: n._id,
          title: n.title,
          description: n.description,
          city: n.city,
          zone: n.zone,
          sendType: n.sendType,
          image: n.image,
          createdAt: n.createdAt,
        },
      ]);
      setModals((m) => ({ ...m, add: false }));
      setForm({ title: "", description: "", city: [], zone: [], sendType: "all", image: null });
      showAlert("success", "Notification Created");
    } catch (e) {
      showAlert("error", e.response?.data?.message || "Failed to add notification");
    }
  };

  const editNotification = async () => {
    if (!selected) return;
    try {
      showAlert("loading", "Updating notification...");
      const fd = toFormData(form);
      const res = await put(`${ENDPOINTS.EDIT_NOTIFICATION}/${selected.id}`, fd);
      const u = res.data.notification;
      setNotifications((p) =>
        p.map((x) =>
          x.id === selected.id
            ? {
                ...x,
                title: u.title || x.title,
                description: u.description || x.description,
                city: u.city || x.city,
                zone: u.zone || x.zone,
                sendType: u.sendType,
                image: u.image || x.image,
              }
            : x
        )
      );
      setModals((m) => ({ ...m, edit: false }));
      setSelected(null);
      setForm({ title: "", description: "", city: [], zone: [], sendType: "all", image: null });
      showAlert("success", "Notification Updated");
    } catch (e) {
      showAlert("error", e.response?.data?.message || "Failed to edit notification");
    }
  };

  const deleteNotification = async (id) => {
    try {
      showAlert("loading", "Deleting...");
      await del(`${ENDPOINTS.DELETE_NOTIFICATION}/${id}`);
      setNotifications((p) => p.filter((n) => n.id !== id));
      showAlert("success", "Notification deleted");
    } catch (e) {
      showAlert("error", e.response?.data?.message || "Failed to delete");
    }
  };

  /* ------------------ Derived for DataTable ------------------ */
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const cityNames = mapCityNames(n.city, zones).join(" ").toLowerCase();
      const zoneNames = mapZoneNames(n.zone, zones, n.city).join(" ").toLowerCase();
      return (
        n.title.toLowerCase().includes(filterText.toLowerCase()) ||
        cityNames.includes(filterText.toLowerCase()) ||
        zoneNames.includes(filterText.toLowerCase())
      );
    });
  }, [notifications, filterText, zones]);

  // columns for react-data-table-component
  const columns = useMemo(
    () => [
      {
        name: "Sr No",
        cell: (row, index) => (currentPage - 1) * perPage + index + 1,
        width: "80px",
        sortable: false,
      },
      { name: "Title", selector: (row) => row.title, sortable: true, wrap: true },
      { name: "Description", selector: (row) => row.description, sortable: false, wrap: true },
      {
        name: "City",
        selector: (row) => renderCitiesText(row, zones),
        sortable: false,
        cell: (row) => (
          <div
            style={{ color: "#0056d2", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => onCityClick(row, zones, openInfo)}
          >
            {renderCitiesText(row, zones)}
          </div>
        ),
        grow: 1,
      },
      { name: "Send To", selector: (row) => row.sendType || "-", sortable: true },
      {
        name: "Image",
        selector: (row) => row.image,
        cell: (row) =>
          row.image ? (
            <Avatar
              src={`${process.env.REACT_APP_IMAGE_LINK}${row.image}`}
              sx={{ width: 40, height: 40, cursor: "pointer" }}
              onClick={() => openImage(row.image)}
            />
          ) : (
            "-"
          ),
        width: "90px",
      },
      {
        name: "Action",
        cell: (row) => (
          <div style={{ display: "flex", gap: 6 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(row)}>
                <EditIcon sx={{ fontSize: 18, color: "#007BFF" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Send Notification">
              <IconButton size="small" onClick={() => sendNotification(row)}>
                <SendIcon sx={{ fontSize: 18, color: "#00c853" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => deleteNotification(row.id)}>
                <DeleteIcon sx={{ fontSize: 18, color: "#dc3545" }} />
              </IconButton>
            </Tooltip>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [perPage, currentPage, zones]
  );

  /* ------------------ Small render helpers ------------------ */

  const renderCitiesText = (n, zonesArr) =>
    !n.city || n.city.includes("all") ? "All Cities" : mapCityNames(n.city, zonesArr).join(", ");
  const onCityClick = (n, zonesArr, openInfoFn) => {
    const cities = mapCityNames(n.city, zonesArr);
    const zonesList = mapZoneNames(n.zone, zonesArr, n.city);
    openInfoFn("City & Zones", ["Cities:", ...cities, "", "Zones:", ...zonesList]);
  };

  /* ------------------ DataTable pagination handling ------------------ */
  const handlePageChange = (page) => setCurrentPage(page);
  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Notification List</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              View and manage all notifications
            </p>
          </div>
          <Button
            onClick={openAdd}
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 150,
              fontSize: 12,
              color: "white",
              letterSpacing: "1px",
            }}
          >
            + Add Notification
          </Button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 17 }}>Show Entries </label>
            <select
              value={perPage}
              onChange={(e) => handlePerRowsChange(parseInt(e.target.value))}
              style={{
                fontSize: 16,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              {[5, 10, 20, 30].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <label style={{ fontSize: 17, marginRight: 8 }}>Search:</label>
            <input
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search notifications..."
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                height: "38px",
                width: "280px",
                border: "1px solid #ccc",
                fontSize: 16,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filtered}
          customStyles={customStyles}
          pagination
          paginationServer={false}
          paginationPerPage={perPage}
          paginationTotalRows={filtered.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={(newPerPage) => handlePerRowsChange(newPerPage)}
          highlightOnHover
          responsive
          noHeader
        />
      </div>

      {/* Image Modal */}
      <Dialog open={modals.image} onClose={closeImage} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Image Preview
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}
        >
          {selected?.image && (
            <img
              src={`${process.env.REACT_APP_IMAGE_LINK}${selected.image}`}
              alt="Notification"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={closeImage}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Modal */}
      <Dialog
        open={modals.add}
        onClose={() => setModals((m) => ({ ...m, add: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: 'Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Add Notification
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px" }}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />

          {/* City multi-select */}
          <TextField
            select
            label="City"
            fullWidth
            margin="normal"
            SelectProps={{
              multiple: true,
              renderValue: (sel) =>
                sel.includes("all") ? "All Cities" : mapCityNames(sel, zones).join(", "),
            }}
            value={form.city}
            onChange={(e) => {
              let v = cleanMulti(e.target.value);
              if (v.includes("all")) v = ["all"];
              v = v.filter((x) => !(x === "all" && v.length > 1));
              setForm((p) => ({ ...p, city: v, zone: [] }));
            }}
          >
            <MenuItem value="all">
              <Checkbox checked={form.city.includes("all")} />
              <ListItemText primary="All Cities" />
            </MenuItem>
            {zones.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                <Checkbox checked={form.city.includes(c._id)} />
                <ListItemText primary={c.city} />
              </MenuItem>
            ))}
          </TextField>

          {/* Zone multi-select */}
          <TextField
            select
            label="Zone"
            fullWidth
            margin="normal"
            SelectProps={{
              multiple: true,
              renderValue: (sel) =>
                sel.includes("all") ? "All Zones" : mapZoneNames(sel, zones, form.city).join(", "),
            }}
            value={form.zone}
            onChange={(e) => {
              let v = cleanMulti(e.target.value);
              if (v.includes("all")) v = ["all"];
              v = v.filter((x) => !(x === "all" && v.length > 1));
              setForm((p) => ({ ...p, zone: v }));
            }}
            disabled={form.city.length === 0}
          >
            <MenuItem value="all">
              <Checkbox checked={form.zone.includes("all")} />
              <ListItemText primary="All Zones" />
            </MenuItem>
            {zones
              .filter((c) => form.city.includes("all") || form.city.includes(c._id))
              .flatMap((c) => c.zones || [])
              .map((zn) => (
                <MenuItem key={zn._id} value={zn._id}>
                  <Checkbox checked={form.zone.includes(zn._id)} />
                  <ListItemText primary={zn.zoneTitle} />
                </MenuItem>
              ))}
          </TextField>

          <TextField
            select
            label="Send Type"
            fullWidth
            margin="normal"
            value={form.sendType}
            onChange={(e) => setForm((p) => ({ ...p, sendType: e.target.value }))}
            SelectProps={{ native: true }}
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="driver">Driver</option>
          </TextField>

          <TextField
            label="Image"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.files[0] }))}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setModals((m) => ({ ...m, add: false }))}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={addNotification}
            color="primary"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={modals.edit}
        onClose={() => setModals((m) => ({ ...m, edit: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}
        >
          Edit Notification
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px" }}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>City</InputLabel>
            <Select
              multiple
              value={form.city}
              onChange={(e) => {
                let v = cleanMulti(e.target.value);
                if (v.includes("all")) v = ["all"];
                v = v.filter((x) => !(x === "all" && v.length > 1));
                setForm((p) => ({ ...p, city: v, zone: [] }));
              }}
              input={<OutlinedInput label="City" />}
              renderValue={(sel) =>
                sel.includes("all") ? "All Cities" : mapCityNames(sel, zones).join(", ")
              }
              sx={{ height: 48, borderRadius: "8px" }}
            >
              <MenuItem value="all">
                <Checkbox checked={form.city.includes("all")} />
                <ListItemText primary="All Cities" />
              </MenuItem>
              {zones.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  <Checkbox checked={form.city.includes(c._id)} />
                  <ListItemText primary={c.city} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={form.city.length === 0}>
            <InputLabel>Zone</InputLabel>
            <Select
              multiple
              value={form.zone}
              onChange={(e) => {
                let v = cleanMulti(e.target.value);
                if (v.includes("all")) v = ["all"];
                v = v.filter((x) => !(x === "all" && v.length > 1));
                setForm((p) => ({ ...p, zone: v }));
              }}
              input={<OutlinedInput label="Zone" />}
              renderValue={(sel) =>
                sel.includes("all") ? "All Zones" : mapZoneNames(sel, zones, form.city).join(", ")
              }
              sx={{ height: 48, borderRadius: "8px" }}
            >
              <MenuItem value="all">
                <Checkbox checked={form.zone.includes("all")} />
                <ListItemText primary="All Zones" />
              </MenuItem>
              {zones
                .filter((c) => form.city.includes("all") || form.city.includes(c._id))
                .flatMap((c) => c.zones || [])
                .map((zn) => (
                  <MenuItem key={zn._id} value={zn._id}>
                    <Checkbox checked={form.zone.includes(zn._id)} />
                    <ListItemText primary={zn.zoneTitle} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            select
            label="Send Type"
            fullWidth
            margin="normal"
            value={form.sendType}
            onChange={(e) => setForm((p) => ({ ...p, sendType: e.target.value }))}
            SelectProps={{ native: true }}
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="driver">Driver</option>
          </TextField>

          <TextField
            label="Image"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.files[0] }))}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setModals((m) => ({ ...m, edit: false }))}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editNotification}
            color="primary"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Modal */}
      <Dialog
        open={modals.info}
        onClose={() => setModals((m) => ({ ...m, info: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "22px", fontWeight: "bold" }}>{info.title}</DialogTitle>
        <DialogContent dividers>
          {!info.list.length ? (
            <p>No data</p>
          ) : (
            <ul>
              {info.list.map((it, idx) => (
                <li key={idx} style={{ fontSize: 17, marginBottom: 6 }}>
                  {it}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModals((m) => ({ ...m, info: false }))} color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
