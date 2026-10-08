// Admin app - Return Requests
//  - Admin login            : all GLOBAL stores, with a store filter (global store names only)
//  - "Login as store" mode  : only that store (userType === "store" + storeId in localStorage)
// GET /order/returns (list + full details), PUT /order/returns/:orderId/:returnId/status (approve / reject / picked / refunded)
import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import Modal from "@mui/material/Modal";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

const IS_STORE_MODE = () => localStorage.getItem("userType") === "store";

const RETURNS_URL = ENDPOINTS.GET_RETURN_ORDERS || "/order/returns";

const fetchReturns = async (params) => {
  const res = await get(RETURNS_URL, { authRequired: true, params });
  return res.data;
};

const updateReturn = async (orderId, returnId, payload) => {
  const res = await put(`${RETURNS_URL}/${orderId}/${returnId}/status`, payload, { authRequired: true });
  return res.data;
};

const IMG = process.env.REACT_APP_IMAGE_LINK || "";

const STATUS_META = {
  requested: { label: "Requested", color: "#ef6c00", bg: "#fff3e0" },
  approved: { label: "Approved", color: "#1565c0", bg: "#e3f2fd" },
  rejected: { label: "Rejected", color: "#c62828", bg: "#ffebee" },
  picked: { label: "Picked up", color: "#6a1b9a", bg: "#f3e5f5" },
  refunded: { label: "Refunded", color: "#2e7d32", bg: "#e8f5e9" },
};
const TABS = ["all", "requested", "approved", "rejected", "picked", "refunded"];
const PREVIEW_EXT = ["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp", "svg"];

const TRANSITIONS = {
  requested: ["approved", "rejected"],
  approved: ["picked", "rejected"],
  picked: ["refunded"],
  rejected: [],
  refunded: [],
};

const ACTION_META = {
  approved: { label: "Approve", color: "#1565c0" },
  rejected: { label: "Reject", color: "#c62828" },
  picked: { label: "Mark picked up", color: "#6a1b9a" },
  refunded: { label: "Mark refunded", color: "#2e7d32" },
};

const isPreviewable = (p) =>
  PREVIEW_EXT.includes(String(p || "").split("?")[0].split(".").pop().toLowerCase());

const nextOf = (r) =>
  r && r.allowedNext && r.allowedNext.length ? r.allowedNext : TRANSITIONS[r?.status] || [];

const money = (v) => `₹${Number(v || 0).toFixed(2)}`;

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const styles = `
  .rt-wrap { width:100%; font-family:'Urbanist',sans-serif; }
  .rt-box { width:100%; border-radius:15px; padding:20px; background:#fff; box-shadow:0 2px 5px rgba(0,0,0,.1); }
  .rt-title { font-weight:bold; font-size:26px; }
  .rt-sub { font-size:16px; color:#555; }
  .rt-tabs { display:flex; gap:10px; flex-wrap:wrap; margin:18px 0; }
  .rt-tab { border:none; border-radius:20px; padding:8px 16px; font-size:14px; cursor:pointer; background:#e9ecef; color:#344767; }
  .rt-tab.active { background:#007bff; color:#fff; }
  /* search + store dropdown + per-page dropdown + refresh: always ONE line */
  .rt-controls { display:flex; flex-wrap:nowrap; gap:12px; align-items:center; margin-bottom:16px; overflow-x:auto; }
  .rt-controls input, .rt-controls select { font-size:15px; padding:8px 12px; border-radius:6px; border:1px solid #ccc; outline:none; height:42px; box-sizing:border-box; }
  .rt-controls input { border-radius:20px; flex:1 1 180px; min-width:150px; max-width:260px; }
  .rt-controls select { flex:0 0 auto; max-width:230px; }
  .rt-refresh { flex:0 0 auto; height:42px; padding:0 18px; border-radius:8px; border:none; background:#007bff; color:#fff; cursor:pointer; font-size:14px; white-space:nowrap; }
  .rt-refresh:disabled { background:#9ec9f5; cursor:not-allowed; }
  .rt-table-wrap { overflow-x:auto; width:100%; }
  .rt-table { width:100%; border-collapse:collapse; border:1px solid #007bff; }
  .rt-table th { padding:12px; border:1px solid #ddd; font-size:16px; background:#007bff; color:#fff; text-align:left; white-space:nowrap; }
  .rt-table td { padding:12px; border:1px solid #eee; font-size:15px; background:#fff; vertical-align:top; }
  .rt-row-actions { display:flex; gap:6px; flex-wrap:wrap; min-width:150px; }
  .rt-mini { border:none; border-radius:6px; padding:5px 10px; font-size:12px; color:#fff; cursor:pointer; white-space:nowrap; }
  .rt-badge { display:inline-block; padding:4px 12px; border-radius:14px; font-size:13px; font-weight:600; }
  .rt-link { color:#007bff; cursor:pointer; text-decoration:underline; background:none; border:none; padding:0; font-size:15px; }
  .rt-muted { color:#7b809a; font-size:13px; }
  .rt-clip { max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; vertical-align:bottom; }
  .rt-pager { display:flex; justify-content:space-between; align-items:center; margin-top:18px; flex-wrap:wrap; gap:12px; }
  .rt-pager button { padding:8px 16px; background:#007bff; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:15px; margin-left:8px; }
  .rt-pager button:disabled { background:#ccc; cursor:not-allowed; }
  .rt-error { color:#d32f2f; font-size:14px; margin:8px 0; }
  .rt-ok { color:#2e7d32; font-size:14px; margin:8px 0; font-weight:600; }
  .rt-modal { background:#fff; border-radius:8px; padding:20px; width:900px; max-width:94%; margin:3% auto; max-height:90vh; overflow-y:auto; position:relative; box-shadow:0 4px 16px rgba(0,0,0,.2); outline:none; }
  .rt-close { position:absolute; top:10px; right:16px; font-size:26px; cursor:pointer; color:#999; font-weight:bold; }
  .rt-sec { margin-top:18px; }
  .rt-sec h4 { margin:0 0 8px; color:#344767; font-size:16px; border-bottom:1px solid #eee; padding-bottom:6px; }
  .rt-grid { display:grid; grid-template-columns:150px 1fr; gap:6px 12px; font-size:14px; }
  .rt-grid b { color:#344767; }
  .rt-two { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  @media (max-width:700px) { .rt-two { grid-template-columns:1fr; } }
  .rt-photos { display:flex; gap:10px; flex-wrap:wrap; }
  .rt-photos img { width:96px; height:96px; object-fit:cover; border-radius:8px; border:1px solid #ddd; }
  .rt-items { width:100%; border-collapse:collapse; font-size:14px; margin-top:4px; }
  .rt-items th, .rt-items td { border:1px solid #e0e0e0; padding:8px; text-align:left; }
  .rt-items th { background:#f5f5f5; }
  .rt-items td.num, .rt-items th.num { text-align:right; }
  .rt-total td { font-weight:600; background:#fafafa; }
  .rt-timeline { list-style:none; margin:0; padding:0; }
  .rt-timeline li { position:relative; padding:0 0 12px 22px; font-size:14px; }
  .rt-timeline li:before { content:""; position:absolute; left:4px; top:5px; width:9px; height:9px; border-radius:50%; background:#007bff; }
  .rt-timeline li:after { content:""; position:absolute; left:8px; top:15px; bottom:-2px; width:1px; background:#d0d7e2; }
  .rt-timeline li:last-child:after { display:none; }
  .rt-actions { margin-top:14px; padding:14px; border:1px solid #e0e6ef; border-radius:10px; background:#f8fafd; }
  .rt-actions-row { display:flex; gap:10px; flex-wrap:wrap; }
  .rt-btn { border:none; border-radius:8px; padding:9px 18px; font-size:14px; color:#fff; cursor:pointer; }
  .rt-btn:disabled { opacity:.55; cursor:not-allowed; }
  .rt-btn.ghost { background:#e9ecef; color:#344767; }
  .rt-form { display:flex; flex-direction:column; gap:10px; margin-top:12px; }
  .rt-form label { font-size:13px; color:#344767; font-weight:600; display:flex; flex-direction:column; gap:4px; }
  .rt-form input, .rt-form textarea { font-size:14px; padding:8px 10px; border:1px solid #ccc; border-radius:6px; outline:none; font-family:inherit; }
`;

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { label: status || "-", color: "#555", bg: "#eee" };
  return (
    <span className="rt-badge" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
};

const Row = ({ label, children }) => (
  <>
    <b>{label}</b>
    <span>{children === undefined || children === null || children === "" ? "-" : children}</span>
  </>
);

function ReturnOrders() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");

  // action panel inside the details window
  const [action, setAction] = useState(null); // approved | rejected | picked | refunded
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  // store filter (admin only): only GLOBAL stores, store name only
  useEffect(() => {
    if (IS_STORE_MODE()) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await get(ENDPOINTS.GET_STORE || "/getStore");
        if (!cancelled && Array.isArray(res.data?.stores)) {
          setStores(
            res.data.stores
              .filter((s) => s.serviceScope === "global")
              .map((s) => ({ id: s._id, name: s.storeName }))
              .sort((x, y) => String(x.name || "").localeCompare(String(y.name || ""))),
          );
        }
      } catch (e) {
        if (!cancelled) setStores([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // wait 400 ms after typing, then search from page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false; // ignore a slow response that arrives after a newer one
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { status, page, limit };
        if (search) params.search = search;
        if (IS_STORE_MODE()) {
          const own = localStorage.getItem("storeId");
          if (own) params.storeId = own;
        } else if (storeId) {
          params.storeId = storeId;
        }
        const data = await fetchReturns(params);
        if (cancelled) return;
        setRows(Array.isArray(data.returns) ? data.returns : []);
        setCounts(data.statusCounts || {});
        setTotal(data.count || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        if (cancelled) return;
        const code = err?.response?.status;
        setRows([]);
        if (code === 401) setError("Session expired. Please log out and log in again.");
        else if (code === 403) setError(err?.response?.data?.message || "You do not have permission to view returns.");
        else setError(err?.response?.data?.message || "Failed to load return requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [status, search, page, limit, reloadKey, storeId]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // opens the details window; when `act` is given the action form is already open
  const openDetails = (r, act = null) => {
    setSelected(r);
    setAction(act);
    setForm(act === "refunded" ? { refundAmount: String(r?.itemsValue ?? "") } : {});
    setActionError("");
  };
  const closeDetails = () => {
    if (saving) return;
    setSelected(null);
    setAction(null);
  };

  const startAction = (next) => {
    setActionError("");
    setAction(next);
    setForm(next === "refunded" ? { refundAmount: String(selected?.itemsValue ?? "") } : {});
  };

  const submitAction = async () => {
    if (!selected || !action) return;
    const payload = { status: action };
    if (action === "rejected") {
      const reason = String(form.note || "").trim();
      if (reason.length < 3) return setActionError("Please enter a reject reason (at least 3 characters).");
      payload.note = reason;
    }
    if (action === "approved" && form.note) payload.note = form.note.trim();
    if (action === "picked") {
      payload.courierName = String(form.courierName || "").trim();
      payload.trackingId = String(form.trackingId || "").trim();
    }
    if (action === "refunded") {
      const amt = Number(form.refundAmount);
      if (!Number.isFinite(amt) || amt <= 0) return setActionError("Enter a refund amount greater than 0.");
      if (amt > Number(selected.itemsValue)) {
        return setActionError(`Refund cannot be more than ${money(selected.itemsValue)}.`);
      }
      payload.refundAmount = amt;
      payload.refundReference = String(form.refundReference || "").trim();
    }

    setSaving(true);
    setActionError("");
    try {
      await updateReturn(selected.order.id, selected.returnId, payload);
      setNotice(`Return for order ${selected.order.orderId} marked ${STATUS_META[action].label.toLowerCase()}.`);
      setSelected(null);
      setAction(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not update the return. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const nextActions = selected ? nextOf(selected) : [];

  const actionPanel = selected
    ? nextActions.length > 0 ? (
        <div className="rt-actions">
          <b style={{ color: "#344767" }}>Process this return</b>
          <div className="rt-actions-row" style={{ marginTop: 10 }}>
            {nextActions.map((n) => (
              <button
                key={n}
                className="rt-btn"
                style={{ background: ACTION_META[n].color, outline: action === n ? "3px solid #cfd8e6" : "none" }}
                disabled={saving}
                onClick={() => startAction(n)}
              >
                {ACTION_META[n].label}
              </button>
            ))}
          </div>

          {action && (
            <div className="rt-form">
              {action === "approved" && (
                <label>
                  Note for the customer (optional)
                  <input value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={500} />
                </label>
              )}
              {action === "rejected" && (
                <label>
                  Reject reason (required, shown to the customer)
                  <textarea rows={3} value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={500} />
                </label>
              )}
              {action === "picked" && (
                <>
                  <label>
                    Courier name (optional)
                    <input value={form.courierName || ""} onChange={(e) => setForm({ ...form, courierName: e.target.value })} maxLength={100} />
                  </label>
                  <label>
                    Tracking ID (optional)
                    <input value={form.trackingId || ""} onChange={(e) => setForm({ ...form, trackingId: e.target.value })} maxLength={100} />
                  </label>
                </>
              )}
              {action === "refunded" && (
                <>
                  <label>
                    Refund amount (max {money(selected.itemsValue)})
                    <input type="number" min="0" step="0.01" value={form.refundAmount || ""} onChange={(e) => setForm({ ...form, refundAmount: e.target.value })} />
                  </label>
                  <label>
                    Refund reference / UTR (optional)
                    <input value={form.refundReference || ""} onChange={(e) => setForm({ ...form, refundReference: e.target.value })} maxLength={100} />
                  </label>
                </>
              )}
              {actionError && <div className="rt-error">{actionError}</div>}
              <div className="rt-actions-row">
                <button className="rt-btn" style={{ background: ACTION_META[action].color }} disabled={saving} onClick={submitAction}>
                  {saving ? "Saving..." : `Confirm: ${ACTION_META[action].label}`}
                </button>
                <button className="rt-btn ghost" disabled={saving} onClick={() => setAction(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rt-muted" style={{ marginTop: 16 }}>
          This return is {STATUS_META[selected.status]?.label.toLowerCase() || selected.status} - no further action needed.
        </div>
      )
    : null;

  return (
    <>
      <style>{styles}</style>
      <MDBox
        p={2}
        style={{
          marginLeft: miniSidenav ? "90px" : "280px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div className="rt-wrap">
          <div className="rt-box">
            <div className="rt-title">Return Requests</div>
            <div className="rt-sub">Items customers have asked to return (global orders)</div>

            <div className="rt-tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`rt-tab ${status === t ? "active" : ""}`}
                  onClick={() => {
                    setStatus(t);
                    setPage(1);
                  }}
                >
                  {t === "all" ? "All" : STATUS_META[t].label} ({counts[t] ?? 0})
                </button>
              ))}
            </div>

            <div className="rt-controls">
              <input
                placeholder="Search order id (e.g. OID202)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {!IS_STORE_MODE() && (
                <select
                  value={storeId}
                  onChange={(e) => {
                    setStoreId(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Stores</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <button className="rt-refresh" disabled={loading} onClick={() => setReloadKey((k) => k + 1)}>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {notice && <div className="rt-ok">{notice}</div>}
            {error && <div className="rt-error">{error}</div>}

            <div className="rt-table-wrap">
              <table className="rt-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Reason</th>
                    <th>Photos</th>
                    <th>Requested</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center" }}>
                        No return requests found
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr key={r.returnId || `${r.order?.id}-${i}`}>
                        <td>{from + i}</td>
                        <td>
                          <button className="rt-link" onClick={() => openDetails(r)}>
                            {r.order?.orderId || "-"}
                          </button>
                          {r.store?.storeName && <div className="rt-muted">{r.store.storeName}</div>}
                        </td>
                        <td>
                          {r.customer?.fullName}
                          <div className="rt-muted">{r.customer?.mobileNumber}</div>
                        </td>
                        <td>
                          {r.itemsCount} item(s)
                          <div className="rt-muted">{money(r.itemsValue)}</div>
                        </td>
                        <td>
                          <span className="rt-clip" title={r.reason}>
                            {r.reason || "-"}
                          </span>
                        </td>
                        <td>{r.images?.length || 0}</td>
                        <td>{fmtDate(r.requestedAt)}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>
                          <div className="rt-row-actions">
                            <button className="rt-mini" style={{ background: "#344767" }} onClick={() => openDetails(r)}>
                              View
                            </button>
                            {nextOf(r).map((n) => (
                              <button
                                key={n}
                                className="rt-mini"
                                style={{ background: ACTION_META[n].color }}
                                onClick={() => openDetails(r, n)}
                              >
                                {ACTION_META[n].label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="rt-pager">
              <span>
                Showing {from} to {to} of {total} requests
              </span>
              <div>
                <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading}>
                  Previous
                </button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </MDBox>

      <Modal open={Boolean(selected)} onClose={closeDetails}>
        <div className="rt-modal">
          <span className="rt-close" onClick={closeDetails}>
            ×
          </span>
          {selected && (
            <>
              <h3 style={{ margin: 0, color: "#344767" }}>
                Return for order {selected.order?.orderId} <StatusBadge status={selected.status} />
              </h3>

              {actionPanel}

              <div className="rt-two">
                <div className="rt-sec">
                  <h4>Order information</h4>
                  <div className="rt-grid">
                    <Row label="Order ID">{selected.order?.orderId}</Row>
                    <Row label="Ordered on">{fmtDate(selected.order?.orderedAt)}</Row>
                    <Row label="Order status">{selected.order?.orderStatus}</Row>
                    <Row label="Delivered on">{fmtDate(selected.order?.deliveredAt)}</Row>
                    <Row label="Payment">
                      {selected.order?.cashOnDelivery ? "Cash on delivery" : "Online"}
                      {selected.order?.paymentStatus ? ` (${selected.order.paymentStatus})` : ""}
                    </Row>
                    {!selected.order?.cashOnDelivery && (
                      <Row label="Transaction ID">{selected.order?.transactionId}</Row>
                    )}
                    {selected.order?.shipping?.trackingId && (
                      <Row label="Shipping">
                        {selected.order.shipping.courierName || "-"} | {selected.order.shipping.trackingId}
                        {selected.order.shipping.trackingUrl && (
                          <>
                            {" "}
                            <a href={selected.order.shipping.trackingUrl} target="_blank" rel="noopener noreferrer">
                              Track
                            </a>
                          </>
                        )}
                      </Row>
                    )}
                    <Row label="Order note">{selected.order?.note}</Row>
                  </div>
                </div>

                <div className="rt-sec">
                  <h4>Customer</h4>
                  <div className="rt-grid">
                    <Row label="Name">{selected.customer?.fullName}</Row>
                    <Row label="Mobile">{selected.customer?.mobileNumber}</Row>
                    <Row label="Alternate">{selected.customer?.alternateNumber}</Row>
                    <Row label="Address">{selected.customer?.fullAddress}</Row>
                  </div>
                  <h4 style={{ marginTop: 16 }}>Store</h4>
                  <div className="rt-grid">
                    <Row label="Store">{selected.store?.storeName}</Row>
                    <Row label="Owner">{selected.store?.ownerName}</Row>
                    <Row label="Phone">{selected.store?.phone}</Row>
                  </div>
                </div>
              </div>

              <div className="rt-sec">
                <h4>Return details</h4>
                <div className="rt-grid">
                  <Row label="Requested on">{fmtDate(selected.requestedAt)}</Row>
                  <Row label="Reason">{selected.reason}</Row>
                  <Row label="Customer note">{selected.note}</Row>
                  {selected.status === "rejected" && <Row label="Reject reason">{selected.rejectReason}</Row>}
                  {selected.pickup && (
                    <Row label="Pickup">
                      {selected.pickup.courierName || "-"} | {selected.pickup.trackingId || "-"} |{" "}
                      {fmtDate(selected.pickup.pickedAt)}
                    </Row>
                  )}
                  {selected.refund && (
                    <Row label="Refund">
                      {money(selected.refund.amount)}
                      {selected.refund.reference ? ` | Ref: ${selected.refund.reference}` : ""} |{" "}
                      {fmtDate(selected.refund.refundedAt)}
                    </Row>
                  )}
                </div>
              </div>

              <div className="rt-sec">
                <h4>Items to return</h4>
                <table className="rt-items">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="num">Price</th>
                      <th className="num">Qty</th>
                      <th className="num">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((it, idx) => (
                      <tr key={`${it.productId}-${it.varientId || ""}-${idx}`}>
                        <td>
                          {it.image && (
                            <img
                              src={`${IMG}${it.image}`}
                              alt=""
                              style={{ width: 40, height: 40, objectFit: "cover", marginRight: 8, verticalAlign: "middle" }}
                            />
                          )}
                          {it.name || "-"}
                        </td>
                        <td className="num">{money(it.price)}</td>
                        <td className="num">{it.quantity}</td>
                        <td className="num">{money(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="rt-total">
                      <td colSpan="3" style={{ textAlign: "right" }}>
                        Returned items value
                      </td>
                      <td className="num">{money(selected.itemsValue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="rt-sec">
                <h4>Full order ({selected.order?.orderId})</h4>
                <table className="rt-items">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="num">Price</th>
                      <th className="num">Qty</th>
                      <th className="num">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.order?.items || []).map((it, idx) => (
                      <tr key={`${it.name}-${idx}`}>
                        <td>{it.name || "-"}</td>
                        <td className="num">{money(it.price)}</td>
                        <td className="num">{it.quantity}</td>
                        <td className="num">{money(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ textAlign: "right" }}>Delivery charges</td>
                      <td className="num">{money(selected.order?.deliveryCharges)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" style={{ textAlign: "right" }}>Platform fee</td>
                      <td className="num">{money(selected.order?.platformFee)}</td>
                    </tr>
                    <tr className="rt-total">
                      <td colSpan="3" style={{ textAlign: "right" }}>Order total</td>
                      <td className="num">{money(selected.order?.totalPrice)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="rt-sec">
                <h4>Customer photos</h4>
                <div className="rt-photos">
                  {(selected.images || []).length === 0 && <span className="rt-muted">No photos attached</span>}
                  {(selected.images || []).map((p, idx) => (
                    <a key={p} href={`${IMG}${p}`} target="_blank" rel="noopener noreferrer">
                      {isPreviewable(p) ? (
                        <img src={`${IMG}${p}`} alt={`Return photo ${idx + 1}`} />
                      ) : (
                        <span className="rt-link">File {idx + 1}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {(selected.history || []).length > 0 && (
                <div className="rt-sec">
                  <h4>Timeline</h4>
                  <ul className="rt-timeline">
                    {selected.history.map((h, idx) => (
                      <li key={idx}>
                        <b>{STATUS_META[h.status]?.label || h.status}</b>
                        {h.by ? ` by ${h.by}` : ""} <span className="rt-muted">{fmtDate(h.at)}</span>
                        {h.note && <div className="rt-muted">{h.note}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </>
          )}
        </div>
      </Modal>
    </>
  );
}

export default ReturnOrders;
