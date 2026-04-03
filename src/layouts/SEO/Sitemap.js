import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import {
  Typography,
  Button,
  CircularProgress,
  TextField,
  Paper,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import { useMaterialUIController } from "context";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Sitemap() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [loading, setLoading] = useState(false);
  const [sitemaps, setSitemaps] = useState([]);
  const [message, setMessage] = useState("");

  const [url, setUrl] = useState("");
  const [freq, setFreq] = useState("weekly");
  const [priority, setPriority] = useState(0.8);
  const [editingId, setEditingId] = useState(null);

  const fetchSitemap = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/getSitemap`);
      const data = await res.json();
      setSitemaps(data?.sitemap || []);
    } catch (err) {
      console.error("Error fetching sitemap:", err);
      setMessage("Failed to load sitemaps");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!url.trim()) {
      setMessage("URL cannot be empty");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const body = {
        url,
        lastmod: new Date(),
        changefreq: freq,
        priority,
        status: true,
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/createSitemap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setMessage(data.message || "Sitemap saved successfully");
      await fetchSitemap();
      setUrl("");
      setFreq("weekly");
      setPriority(0.8);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving sitemap:", err);
      setMessage("Failed to save sitemap");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/createSitemap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setMessage(data.message || "Sitemap regenerated successfully");
      await fetchSitemap();
    } catch (err) {
      console.error("Error regenerating sitemap:", err);
      setMessage("Failed to regenerate sitemap");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setUrl(item.url || "");
    setFreq(item.changefreq || "weekly");
    setPriority(item.priority ?? 0.8);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDel = window.confirm("Delete this sitemap entry?");
    if (!confirmDel) return;

    setLoading(true);
    setMessage("");
    try {
      const entry = sitemaps.find((s) => s._id === id);
      if (!entry) throw new Error("Entry not found");

      const body = {
        url: entry.url,
        lastmod: entry.lastmod || new Date(),
        changefreq: entry.changefreq || "weekly",
        priority: entry.priority ?? 0.8,
        status: false,
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/createSitemap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setMessage(data.message || "Sitemap entry deleted successfully");
      await fetchSitemap();
    } catch (err) {
      console.error("Error deleting sitemap:", err);
      setMessage("Failed to delete sitemap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitemap();
  }, []);

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={3} sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Sitemap Manager
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage your site’s <code>sitemap.xml</code>. Add, edit, and regenerate entries.
      </Typography>

      {message && (
        <Typography
          variant="body2"
          mb={2}
          color={message.includes("Failed") ? "error.main" : "success.main"}
        >
          {message}
        </Typography>
      )}

      {/* Form */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Page URL"
              variant="outlined"
              size="small"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              helperText="Include full URL (https://example.com/page)"
            />
            <TextField
              label="Change Frequency"
              variant="outlined"
              size="small"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              sx={{ width: { xs: "100%", md: 220 } }}
            />
            <TextField
              label="Priority"
              variant="outlined"
              size="small"
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseFloat(e.target.value))}
              sx={{ width: { xs: "100%", md: 120 } }}
              inputProps={{ step: 0.1, min: 0, max: 1 }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loading}
              sx={{ px: 3 }}
               style={{color:"white"}}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : editingId ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>

            <Button
              variant="outlined"
              color="success"
              onClick={handleRegenerate}
              disabled={loading}
                sx={{
    color: '#546e7a',
    borderColor: '#cfd8dc',
    backgroundColor: '#f5f7f8',
    textTransform: 'none',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: '#e0e0e0',
      borderColor: '#b0bec5',
    },
  }}

            >
              Regenerate XML
            </Button>
            {editingId && (
              <Button
                variant="text"
                color="inherit"
                onClick={() => {
                  setEditingId(null);
                  setUrl("");
                  setFreq("weekly");
                  setPriority(0.8);
                  setMessage("");
                }}
              >
                Cancel Edit
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Entries List */}
      <Typography variant="h6" mb={1}>
        Existing Sitemap Entries ({sitemaps.length})
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 1,
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
          p: 1.5,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
          <Typography sx={{ flex: 4, fontWeight: 500 }}>URL</Typography>
          <Typography sx={{ flex: 2, fontWeight: 500 }}>Last Modified</Typography>
          <Typography sx={{ flex: 1.5, fontWeight: 500 }}>Change Freq</Typography>
          <Typography sx={{ flex: 1, fontWeight: 500 }}>Priority</Typography>
          <Typography sx={{ flex: 1.5, fontWeight: 500, textAlign: "right" }}>
            Actions / Status
          </Typography>
        </Stack>
      </Paper>

      {/* Rows */}
      {loading ? (
        <div style={{ padding: 20, textAlign: "center" }}>
          <CircularProgress />
        </div>
      ) : sitemaps.length === 0 ? (
        <Typography color="text.secondary" sx={{ p: 2 }}>
          No sitemap URLs found.
        </Typography>
      ) : (
        sitemaps.map((item) => (
          <Paper
            key={item._id}
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: "1px solid #eee",
              mb: 1,
              "&:hover": { backgroundColor: "#fafafa" },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Typography
                sx={{ flex: 4, color: "#1565c0", fontWeight: 500, wordBreak: "break-word" }}
              >
                {item.url}
              </Typography>
              <Typography sx={{ flex: 2, fontSize: 13 }}>
                {item.lastmod ? new Date(item.lastmod).toLocaleString() : "-"}
              </Typography>
              <Typography sx={{ flex: 1.5, fontSize: 13 }}>{item.changefreq}</Typography>
              <Typography sx={{ flex: 1, fontSize: 13 }}>{item.priority}</Typography>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ flex: 1.5 }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    mr: 1,
                    color: item.status ? "success.main" : "text.secondary",
                  }}
                >
                  {item.status ? "Active" : "Inactive"}
                </Typography>
                <IconButton size="small" onClick={() => handleEdit(item)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(item._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))
      )}
    </MDBox>
  );
}
