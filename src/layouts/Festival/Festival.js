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
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import DataTable from "react-data-table-component";
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, post, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function Festival() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [eventData, setEventData] = useState({
    eventTitle: "",
    type: "",
    fontColor: "#000000",
    startTime: null,
    endTime: null,
    image: null,
    eventStatus: true,
  });

  // Fetch events
  const fetchEvents = async () => {
    try {
      showAlert("loading", "Fetching events...");
      const response = await post(ENDPOINTS.GET_EVENTS, { role: "admin" });

      const data = response.data;

      if (Array.isArray(data)) {
        setEvents(
          data.map((item) => ({
            eventTitle: item.eventDetails.eventTitle,
            type: item.type,
            startTime: item.startTime ? new Date(item.startTime) : null,
            endTime: item.endTime ? new Date(item.endTime) : null,
            eventImage: item.eventDetails.eventImage,
            fontColor: item.eventDetails.fontColor || "#000000",
            eventStatus: item.eventStatus ?? true,
            _id: item._id,
          }))
        );
        showAlert("info", "", 1);
      } else if (data.eventStatus) {
        setEvents([
          {
            ...data.eventDetails,
            eventStatus: data.eventStatus ?? true,
            startTime: data.startTime ? new Date(data.startTime) : null,
            endTime: data.endTime ? new Date(data.endTime) : null,
          },
        ]);
        showAlert("info", "", 1);
      } else {
        setEvents([]);
        showAlert("info", "", 1);
      }
    } catch (error) {
      showAlert("error", "Failed to fetch events.");
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Modal Handlers
  const handleOpenImageModal = (image) => {
    setSelectedEvent({ image });
    setImageModalOpen(true);
  };
  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedEvent(null);
  };

  const handleOpenAddModal = () => {
    setEventData({
      eventTitle: "",
      type: "",
      fontColor: "#000000",
      startTime: null,
      endTime: null,
      image: null,
      eventStatus: true,
    });
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setSelectedEvent(event);
    setEventData({
      eventTitle: event.eventTitle,
      type: event.type,
      fontColor: event.fontColor || "#000000",
      startTime: event.startTime ? moment(event.startTime) : null,
      endTime: event.endTime ? moment(event.endTime) : null,
      image: null,
      eventStatus: event.eventStatus ?? true,
    });
    setEditModalOpen(true);
  };

  // Add/Edit event API calls
  const handleAddEvent = async () => {
    const formData = new FormData();
    formData.append("eventTitle", eventData.eventTitle);
    formData.append("type", eventData.type);
    formData.append("fontColor", eventData.fontColor);
    formData.append("startTime", eventData.startTime);
    formData.append("endTime", eventData.endTime);
    formData.append("eventStatus", eventData.eventStatus);
    if (eventData.image) formData.append("image", eventData.image);

    try {
      showAlert("loading", "Adding event...");
      const response = await post(ENDPOINTS.ADD_EVENT, formData);
      const data = response.data;
      showAlert("success", data.message || "Event added successfully!");
      setAddModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
      showAlert("error", "Something went wrong while adding event.");
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent) return;
    const formData = new FormData();
    formData.append("eventTitle", eventData.eventTitle);
    formData.append("type", eventData.type);
    formData.append("fontColor", eventData.fontColor);
    formData.append("startTime", eventData.startTime);
    formData.append("endTime", eventData.endTime);
    formData.append("eventStatus", eventData.eventStatus);
    if (eventData.image) formData.append("image", eventData.image);

    try {
      showAlert("loading", "Updating event...");
      const response = await put(`${ENDPOINTS.EDIT_EVENT}/${selectedEvent._id}`, formData);
      const data = response.data;
      showAlert("success", data.message || "Event updated successfully!");
      setEditModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
      showAlert("error", "Something went wrong while updating event.");
    }
  };

  // Status toggle with time check
  const handleToggleStatus = (row) => {
    if (!row.startTime || !row.endTime) {
      setSelectedEvent(row);
      setEventData({
        ...eventData,
        startTime: row.startTime ? moment(row.startTime) : null,
        endTime: row.endTime ? moment(row.endTime) : null,
        eventStatus: !row.eventStatus,
      });
      setStatusModalOpen(true);
      return;
    }
    toggleStatusApi(row._id, !row.eventStatus, row.startTime, row.endTime);
  };

  const toggleStatusApi = async (_id, status, start, end) => {
    try {
      const formData = new FormData();
      formData.append("eventStatus", status);
      formData.append("startTime", start);
      formData.append("endTime", end);

      await put(`${ENDPOINTS.EDIT_EVENT}/${_id}`,formData)

      fetchEvents();
      setStatusModalOpen(false);
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to update status.");
    }
  };

  const columns = [
    { name: "Title", selector: (row) => row.eventTitle, sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: "Start Time",
      selector: (row) => (row.startTime ? moment(row.startTime).format("lll") : "-"),
      sortable: true,
    },
    {
      name: "End Time",
      selector: (row) => (row.endTime ? moment(row.endTime).format("lll") : "-"),
      sortable: true,
    },
    {
      name: "Image",
      cell: (row) =>
        row.eventImage ? (
          <Avatar
            src={`${process.env.REACT_APP_IMAGE_LINK}${row.eventImage}`}
            sx={{ width: 40, height: 40, cursor: "pointer" }}
            onClick={() => handleOpenImageModal(row.eventImage)}
          />
        ) : (
          "-"
        ),
    },
    {
      name: "Status",
      cell: (row) => (
        <Switch
          checked={row.eventStatus ?? true}
          onChange={() => handleToggleStatus(row)}
          color="primary"
        />
      ),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <Button
          onClick={() => handleOpenEditModal(row)}
          sx={{ backgroundColor: "#007BFF", color: "#fff", marginRight: 1 }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const filteredEvents = events.filter((e) =>
    e.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MDBox
      sx={{ ml: { xs: 0, sm: miniSidenav ? "80px" : "250px" }, mt: "30px", p: { xs: 1, sm: 2 } }}
    >
      <div style={{ width: "100%", padding: "0 20px", boxSizing: "border-box" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "bold" }}>Event List</h2>
            <p style={{ margin: 0, fontSize: "16px", color: "#555" }}>View and manage events</p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
              flex: 1,
              minWidth: "250px",
            }}
          >
            <TextField
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                width: { xs: "100%", sm: "200px" },
                backgroundColor: "white",
              }}
            />
            <Button
              style={{
                backgroundColor: "#00c853",
                height: 40,
                width: "fit-content",
                fontSize: 12,
                color: "white",
                letterSpacing: "1px",
              }}
              onClick={handleOpenAddModal}
            >
              + Add Event
            </Button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={filteredEvents}
            pagination
            highlightOnHover
            pointerOnHover
            noDataComponent="No events found"
          />
        </div>
      </div>
      {/* Image Modal */}
      <Dialog open={imageModalOpen} onClose={handleCloseImageModal} maxWidth="lg" fullWidth>
        <DialogTitle>Event Image</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
          {selectedEvent?.image && (
            <img
              src={`${process.env.REACT_APP_IMAGE_LINK}${selectedEvent.image}`}
              alt="Event"
              style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageModal} color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Modals */}
      {[
        ["Add", addModalOpen, setAddModalOpen, handleAddEvent],
        ["Edit", editModalOpen, setEditModalOpen, handleEditEvent],
      ].map(([title, open, setOpen, submitHandler], idx) => (
        <Dialog key={idx} open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{title} Event</DialogTitle>
          <DialogContent
            sx={{
              overflowX: "hidden",
              maxHeight: "80vh",
              paddingX: { xs: 1.5, sm: 3 },
            }}
          >
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={eventData.eventTitle}
              onChange={(e) => setEventData({ ...eventData, eventTitle: e.target.value })}
            />
            <TextField
              select
              label="Type"
              fullWidth
              margin="normal"
              value={eventData.type}
              onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
              InputProps={{
                sx: {
                  height: 46, // Increases the overall height
                  fontSize: "16px", // Font size of the selected value
                },
              }}
              SelectProps={{
                sx: {
                  fontSize: "14px", // Font size of the dropdown options
                },
                MenuProps: {
                  PaperProps: {
                    sx: {
                      fontSize: "14px",
                    },
                  },
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 46,
                  fontSize: "16px",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "12px",
                },
              }}
            >
              <MenuItem value="Festival">Festival</MenuItem>
              <MenuItem value="Alert" disabled>
                Alert
              </MenuItem>
            </TextField>
            <TextField
              label="Font Color"
              type="color"
              fullWidth
              margin="normal"
              value={eventData.fontColor}
              onChange={(e) => setEventData({ ...eventData, fontColor: e.target.value })}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Start Time
            </Typography>
            <Datetime
              value={eventData.startTime}
              onChange={(date) => setEventData({ ...eventData, startTime: date })}
              inputProps={{
                placeholder: "Select start time",
                style: { width: "100%", padding: 10 },
              }}
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              End Time
            </Typography>
            <Datetime
              value={eventData.endTime}
              onChange={(date) => setEventData({ ...eventData, endTime: date })}
              inputProps={{ placeholder: "Select end time", style: { width: "100%", padding: 10 } }}
            />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Upload Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                textAlign: "left",
                padding: "10px 14px",
                justifyContent: "start",
                overflow: "hidden",
                whiteSpace: "nowrap",
                color: "#000",
                textOverflow: "ellipsis",
              }}
            >
              {eventData.image?.name || "Choose File"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setEventData({ ...eventData, image: e.target.files[0] })}
              />
            </Button>

            <FormControlLabel
              control={
                <Switch
                  checked={eventData.eventStatus}
                  onChange={(e) => setEventData({ ...eventData, eventStatus: e.target.checked })}
                  color="primary"
                />
              }
              label="Active Status"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="error">
              Cancel
            </Button>
            <Button onClick={submitHandler} color="primary">
              {title === "Add" ? "Add" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      ))}

      {/* Status Modal */}
      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Event Time</DialogTitle>
        <DialogContent>
          <Typography>Please set Start and End time before activating event.</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Start Time
          </Typography>
          <Datetime
            value={eventData.startTime}
            onChange={(date) => setEventData({ ...eventData, startTime: date })}
            inputProps={{ placeholder: "Select start time", style: { width: "100%", padding: 10 } }}
          />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            End Time
          </Typography>
          <Datetime
            value={eventData.endTime}
            onChange={(date) => setEventData({ ...eventData, endTime: date })}
            inputProps={{ placeholder: "Select end time", style: { width: "100%", padding: 10 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={() =>
              toggleStatusApi(
                selectedEvent._id,
                eventData.eventStatus,
                eventData.startTime,
                eventData.endTime
              )
            }
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
