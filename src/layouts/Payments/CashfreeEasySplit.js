import React, { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, Tab, Tabs,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { get, post, put } from "api/apiClient";

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
const initialVendor = {
  name: "", email: "", phone: "", payoutMethod: "bank", accountHolder: "",
  accountNumber: "", ifsc: "", upiVpa: "", accountType: "BUSINESS",
  businessType: "", pan: "", gst: "", verifyAccount: true, scheduleOption: 1,
};
const emptyPaymentFilters = { orderId: "", storeId: "", status: "", from: "", to: "" };

export default function CashfreeEasySplit() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [tab, setTab] = useState(0);
  const [payments, setPayments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentFilters, setPaymentFilters] = useState(emptyPaymentFilters);
  const [appliedPaymentFilters, setAppliedPaymentFilters] = useState(emptyPaymentFilters);
  const [selectedStore, setSelectedStore] = useState("");
  const [vendorForm, setVendorForm] = useState(initialVendor);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [refund, setRefund] = useState({ amount: "", vendorAmount: "", note: "" });
  const [recon, setRecon] = useState({ vendorId: "", startDate: "", endDate: "" });
  const [reconResult, setReconResult] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [transferForm, setTransferForm] = useState({ amount: "", remark: "Vendor on-demand settlement" });

  const loadVendors = useCallback(async () => {
    const response = await get("/admin/cashfree/vendors?page=1&limit=100", { authRequired: true });
    setVendors(response.data?.vendors || []);
  }, []);

  const loadVendorOptions = useCallback(async () => {
    const response = await get("/admin/cashfree/vendor-options?limit=500", { authRequired: true });
    setVendorOptions(response.data?.stores || []);
  }, []);

  const loadTransfers = useCallback(async () => {
    const response = await get("/admin/cashfree/transfers?limit=50", { authRequired: true });
    setTransfers(response.data?.transfers || []);
  }, []);

  const loadPayments = useCallback(async () => {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    Object.entries(appliedPaymentFilters).forEach(([key, value]) => {
      if (value) params.set(key, key === "orderId" ? value.trim() : value);
    });
    const response = await get(`/admin/cashfree/payments?${params.toString()}`, { authRequired: true });
    setPayments(response.data?.orders || []);
  }, [appliedPaymentFilters]);

  const reloadCurrentTab = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === 0) await Promise.all([loadPayments(), loadVendorOptions()]);
      if (tab === 1) await Promise.all([loadVendors(), loadTransfers()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load Cashfree Easy Split data.");
    } finally {
      setLoading(false);
    }
  }, [loadPayments, loadTransfers, loadVendorOptions, loadVendors, tab]);

  useEffect(() => { reloadCurrentTab(); }, [reloadCurrentTab]);

  const selectedVendor = vendors.find((vendor) => String(vendor._id) === selectedStore);
  const updateVendorField = (field) => (event) => setVendorForm((current) => ({ ...current, [field]: event.target.value }));

  const registerVendor = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const vendorInput = {
        ...vendorForm,
        kycDetails: {
          account_type: vendorForm.accountType,
          ...(vendorForm.businessType ? { business_type: vendorForm.businessType } : {}),
          ...(vendorForm.pan ? { pan: vendorForm.pan.toUpperCase() } : {}),
          ...(vendorForm.gst ? { gst: vendorForm.gst.toUpperCase() } : {}),
        },
        idempotencyKey: window.crypto?.randomUUID?.() || `vendor-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      };
      const { data } = selectedVendor?.cashfreeEasySplit?.vendorId
        ? await put(`/admin/cashfree/vendors/${selectedStore}/details`, vendorInput, { authRequired: true })
        : await post(`/admin/cashfree/vendors/${selectedStore}`, vendorInput, { authRequired: true });
      setNotice(data.message || "Vendor registration submitted.");
      setVendorForm(initialVendor);
      setSelectedStore("");
      await loadVendors();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Cashfree vendor registration failed.");
    }
  };

  const syncVendor = async (vendor) => {
    setError("");
    try {
      await get(`/admin/cashfree/vendors/${vendor._id}/status`, { authRequired: true });
      await loadVendors();
      setNotice("Vendor status refreshed from Cashfree.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not refresh vendor status.");
    }
  };

  const changeVendorStatus = async (vendor, status) => {
    setError("");
    try {
      await put(`/admin/cashfree/vendors/${vendor._id}/status`, { status }, { authRequired: true });
      await loadVendors();
      setNotice(`Vendor status updated to ${status}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update vendor status.");
    }
  };

  const syncSplit = async (order) => {
    setError("");
    try {
      const { data } = await get(`/admin/cashfree/orders/${encodeURIComponent(order.orderId)}/split`, { authRequired: true });
      setNotice(`Split and settlement details refreshed for ${order.orderId}.`);
      await loadPayments();
      setSelectedSplit({ orderId: order.orderId, split: data.split || order.cashfreeEasySplit });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not refresh split details.");
    }
  };

  const createRefund = async (event) => {
    event.preventDefault();
    if (!selectedOrder) return;
    setError("");
    setNotice("");
    try {
      await post(`/admin/cashfree/orders/${encodeURIComponent(selectedOrder.orderId)}/refunds`, {
        refundAmount: refund.amount,
        vendorRefundAmount: refund.vendorAmount || 0,
        note: refund.note,
        idempotencyKey: window.crypto?.randomUUID?.() || `refund-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      }, { authRequired: true });
      setNotice("Refund request sent to Cashfree.");
      setRefund({ amount: "", vendorAmount: "", note: "" });
      setSelectedOrder(null);
      await loadPayments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Refund request failed.");
    }
  };

  const runReconciliation = async (event) => {
    event.preventDefault();
    setError("");
    setReconResult(null);
    try {
      const { data } = await post("/admin/cashfree/reconciliation/vendor", {
        vendorId: recon.vendorId || undefined,
        startDate: recon.startDate ? new Date(recon.startDate).toISOString() : undefined,
        endDate: recon.endDate ? new Date(recon.endDate).toISOString() : undefined,
        limit: 100,
      }, { authRequired: true });
      setReconResult(data.report);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Cashfree reconciliation request failed.");
    }
  };

  const requestVendorSettlement = async (event) => {
    event.preventDefault();
    if (!selectedTransfer) return;
    const confirmed = window.confirm(`Request Cashfree on-demand settlement of ₹${Number(transferForm.amount).toFixed(2)} for ${selectedTransfer.storeName}? Cashfree will validate eligibility and available vendor balance.`);
    if (!confirmed) return;
    setError("");
    setNotice("");
    try {
      const { data } = await post(`/admin/cashfree/vendors/${selectedTransfer._id}/transfers`, {
        transferAmount: transferForm.amount,
        remark: transferForm.remark,
        idempotencyKey: window.crypto?.randomUUID?.() || `transfer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        confirmVendorSettlement: true,
      }, { authRequired: true });
      setNotice(data.message || "Cashfree transfer request submitted.");
      setSelectedTransfer(null);
      setTransferForm({ amount: "", remark: "Vendor on-demand settlement" });
      await loadTransfers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Cashfree settlement request failed.");
    }
  };

  const inputProps = { fullWidth: true, size: "small", sx: { mb: 1.5 } };

  return (
    <MDBox p={2} sx={{ ml: miniSidenav ? "80px" : "250px", transition: "margin-left .3s ease" }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, mt: 3, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700}>Cashfree Easy Split</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Manage vendor onboarding, Cashfree payment allocations, refunds and reconciliation.
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mt: 2 }}>{notice}</Alert>}
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mt: 2, mb: 2 }}>
          <Tab label="Payments" />
          <Tab label="Vendors" />
          <Tab label="Reconciliation" />
        </Tabs>
        {loading && <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}><CircularProgress size={28} /></Box>}

        {!loading && tab === 0 && <>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); setAppliedPaymentFilters({ ...paymentFilters, orderId: paymentFilters.orderId.trim() }); }} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(150px, 1fr))" }, gap: 1, mb: 2 }}>
            <TextField label="Order ID" size="small" value={paymentFilters.orderId} onChange={(event) => setPaymentFilters({ ...paymentFilters, orderId: event.target.value })} />
            <TextField select label="Vendor / store" size="small" value={paymentFilters.storeId} onChange={(event) => setPaymentFilters({ ...paymentFilters, storeId: event.target.value })}>
              <MenuItem value="">All vendors</MenuItem>
              {vendorOptions.map((vendor) => <MenuItem key={vendor._id} value={vendor._id}>{vendor.storeName || vendor._id}</MenuItem>)}
            </TextField>
            <TextField select label="Payment status" size="small" value={paymentFilters.status} onChange={(event) => setPaymentFilters({ ...paymentFilters, status: event.target.value })}>
              <MenuItem value="">All statuses</MenuItem>
              {["Successful", "Failed", "Pending", "Verification Pending", "ACTIVE", "EXPIRED"].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
            <TextField type="date" label="From" size="small" InputLabelProps={{ shrink: true }} value={paymentFilters.from} onChange={(event) => setPaymentFilters({ ...paymentFilters, from: event.target.value })} />
            <TextField type="date" label="To" size="small" InputLabelProps={{ shrink: true }} value={paymentFilters.to} onChange={(event) => setPaymentFilters({ ...paymentFilters, to: event.target.value })} />
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button type="submit" variant="contained">Search</Button>
              <Button type="button" variant="outlined" onClick={() => { setPaymentFilters(emptyPaymentFilters); setAppliedPaymentFilters(emptyPaymentFilters); }}>Reset</Button>
              <Button type="button" variant="text" onClick={loadPayments}>Refresh</Button>
            </Box>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead><TableRow>{["Order", "Store", "Payment", "Total", "Vendor share", "Platform share", "Split", "Actions"].map((label) => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {payments.map((order) => <TableRow key={order._id} hover>
                  <TableCell>{order.orderId}<Typography variant="caption" display="block" color="text.secondary">{new Date(order.createdAt).toLocaleString()}</Typography></TableCell>
                  <TableCell>{order.storeId?.storeName || "—"}</TableCell>
                  <TableCell><Chip size="small" label={order.paymentStatus || order.cashfreeStatus || "Unknown"} /></TableCell>
                  <TableCell>{money(order.totalPrice)}</TableCell>
                  <TableCell>{money((order.cashfreeEasySplit?.vendorAmountMinor || 0) / 100)}</TableCell>
                  <TableCell>{money((order.cashfreeEasySplit?.platformAmountMinor || 0) / 100)}</TableCell>
                  <TableCell>{order.cashfreeEasySplit?.providerSyncStatus || order.cashfreeEasySplit?.status || "No split"}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => syncSplit(order)}>Sync</Button>
                    {order.paymentStatus === "Successful" && <Button size="small" color="warning" onClick={() => { setSelectedOrder(order); setRefund({ amount: "", vendorAmount: "", note: "" }); }}>Refund</Button>}
                  </TableCell>
                </TableRow>)}
                {!payments.length && <TableRow><TableCell colSpan={8} align="center">No Cashfree payment records found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Box>
          {selectedSplit && <Paper variant="outlined" sx={{ mt: 2, p: 2, overflow: "auto", maxHeight: 400 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="h6">Split and settlement · {selectedSplit.orderId}</Typography>
              <Button size="small" onClick={() => setSelectedSplit(null)}>Close</Button>
            </Box>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(selectedSplit.split, null, 2)}</pre>
          </Paper>}
          {selectedOrder && <Paper component="form" onSubmit={createRefund} variant="outlined" sx={{ p: 2, mt: 2, maxWidth: 680 }}>
            <Typography variant="h6" mb={1}>Refund order {selectedOrder.orderId}</Typography>
            <TextField {...inputProps} required type="number" label="Customer refund amount (₹)" inputProps={{ min: 0.01, step: 0.01, max: selectedOrder.totalPrice }} value={refund.amount} onChange={(event) => setRefund({ ...refund, amount: event.target.value })} />
            {selectedOrder.cashfreeEasySplit?.enabled && <TextField {...inputProps} required type="number" label="Amount to debit from vendor split (₹)" inputProps={{ min: 0, step: 0.01 }} value={refund.vendorAmount} onChange={(event) => setRefund({ ...refund, vendorAmount: event.target.value })} />}
            <TextField {...inputProps} required label="Refund note" inputProps={{ maxLength: 100 }} value={refund.note} onChange={(event) => setRefund({ ...refund, note: event.target.value })} />
            <Button type="submit" variant="contained" color="warning">Submit refund</Button>
            <Button sx={{ ml: 1 }} onClick={() => setSelectedOrder(null)}>Cancel</Button>
          </Paper>}
        </>}

        {!loading && tab === 1 && <>
          <Box sx={{ overflowX: "auto", mb: 2 }}>
            <Table size="small"><TableHead><TableRow>{["Store", "Owner", "Approval", "Cashfree vendor", "Status", "Actions"].map((label) => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
              <TableBody>{vendors.map((vendor) => <TableRow key={vendor._id} hover>
                <TableCell>{vendor.storeName || "—"}</TableCell><TableCell>{vendor.ownerName || "—"}</TableCell><TableCell>{vendor.approveStatus || "—"}</TableCell>
                <TableCell>{vendor.cashfreeEasySplit?.vendorId || "Not registered"}</TableCell>
                <TableCell><Chip size="small" label={vendor.cashfreeEasySplit?.status || "NOT_REGISTERED"} /></TableCell>
                <TableCell>
                  {vendor.cashfreeEasySplit?.vendorId ? <>
                    <Button size="small" onClick={() => syncVendor(vendor)}>Sync status</Button>
                    <Button size="small" onClick={() => { setSelectedStore(vendor._id); setVendorForm({ ...initialVendor, name: vendor.ownerName || vendor.storeName || "", email: vendor.email || "", phone: vendor.PhoneNumber || "" }); }}>Edit details</Button>
                    {vendor.cashfreeEasySplit.status === "ACTIVE" && <Button size="small" onClick={() => { setSelectedTransfer(vendor); setTransferForm({ amount: "", remark: "Vendor on-demand settlement" }); }}>Settle</Button>}
                    {vendor.cashfreeEasySplit.status === "ACTIVE" && <Button size="small" color="warning" onClick={() => changeVendorStatus(vendor, "BLOCKED")}>Block</Button>}
                    {vendor.cashfreeEasySplit.status === "BLOCKED" && <Button size="small" onClick={() => changeVendorStatus(vendor, "ACTIVE")}>Activate</Button>}
                  </> : <Button size="small" onClick={() => { setSelectedStore(vendor._id); setVendorForm({ ...initialVendor, name: vendor.ownerName || vendor.storeName || "", email: vendor.email || "", phone: vendor.PhoneNumber || "" }); }}>Onboard</Button>}
                </TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </Box>
          {selectedVendor && <Paper component="form" onSubmit={registerVendor} variant="outlined" sx={{ p: 2, maxWidth: 800 }}>
            <Typography variant="h6" mb={1}>
              {selectedVendor.cashfreeEasySplit?.vendorId ? "Update Cashfree vendor details" : "Onboard Cashfree vendor"} · {selectedVendor.storeName}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
              <TextField {...inputProps} required label="Vendor legal name" value={vendorForm.name} onChange={updateVendorField("name")} />
              <TextField {...inputProps} required type="email" label="Vendor email" value={vendorForm.email} onChange={updateVendorField("email")} />
              <TextField {...inputProps} required label="Phone (8-12 digits)" value={vendorForm.phone} onChange={updateVendorField("phone")} />
              <TextField {...inputProps} select label="Payout method" value={vendorForm.payoutMethod} onChange={updateVendorField("payoutMethod")}><MenuItem value="bank">Bank account</MenuItem><MenuItem value="upi">UPI</MenuItem></TextField>
              <TextField {...inputProps} required label="Account holder" value={vendorForm.accountHolder} onChange={updateVendorField("accountHolder")} />
              {vendorForm.payoutMethod === "bank" ? <>
                <TextField {...inputProps} required label="Bank account number" value={vendorForm.accountNumber} onChange={updateVendorField("accountNumber")} />
                <TextField {...inputProps} required label="IFSC" value={vendorForm.ifsc} onChange={updateVendorField("ifsc")} />
              </> : <TextField {...inputProps} required label="UPI ID" value={vendorForm.upiVpa} onChange={updateVendorField("upiVpa")} />}
              <TextField {...inputProps} select label="KYC account type" value={vendorForm.accountType} onChange={updateVendorField("accountType")}><MenuItem value="BUSINESS">Business</MenuItem><MenuItem value="INDIVIDUAL">Individual</MenuItem></TextField>
              <TextField {...inputProps} label="Business type (if applicable)" value={vendorForm.businessType} onChange={updateVendorField("businessType")} />
              <TextField {...inputProps} label="PAN" value={vendorForm.pan} onChange={updateVendorField("pan")} />
              <TextField {...inputProps} label="GSTIN" value={vendorForm.gst} onChange={updateVendorField("gst")} />
              <TextField {...inputProps} select label="Settlement schedule" value={vendorForm.scheduleOption} onChange={updateVendorField("scheduleOption")}><MenuItem value={1}>Cashfree default (schedule 1)</MenuItem></TextField>
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>Bank and KYC details are sent securely to the backend and Cashfree; Fivlia stores only the Cashfree vendor ID and status.</Alert>
            <Button type="submit" variant="contained">
              {selectedVendor.cashfreeEasySplit?.vendorId ? "Update vendor" : "Submit vendor onboarding"}
            </Button>
            <Button type="button" sx={{ ml: 1 }} onClick={() => setSelectedStore("")}>Cancel</Button>
          </Paper>}
          {selectedTransfer && <Paper component="form" onSubmit={requestVendorSettlement} variant="outlined" sx={{ p: 2, mt: 2, maxWidth: 580 }}>
            <Typography variant="h6" mb={1}>Request vendor settlement · {selectedTransfer.storeName}</Typography>
            <Alert severity="info" sx={{ mb: 1.5 }}>This requests an on-demand Cashfree settlement to the vendor. Cashfree must enable this feature and will check the vendor balance and eligibility.</Alert>
            <TextField {...inputProps} required type="number" label="Settlement amount (₹)" inputProps={{ min: 0.01, step: 0.01 }} value={transferForm.amount} onChange={(event) => setTransferForm({ ...transferForm, amount: event.target.value })} />
            <TextField {...inputProps} required label="Remark" inputProps={{ maxLength: 100 }} value={transferForm.remark} onChange={(event) => setTransferForm({ ...transferForm, remark: event.target.value })} />
            <Button type="submit" variant="contained">Request settlement</Button>
            <Button sx={{ ml: 1 }} onClick={() => setSelectedTransfer(null)}>Cancel</Button>
          </Paper>}
          <Typography variant="h6" mt={3} mb={1}>Recent on-demand settlement requests</Typography>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small"><TableHead><TableRow>{["Store", "Amount", "Request status", "Cashfree settlement ID", "Requested"].map((label) => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
              <TableBody>{transfers.map((transfer) => <TableRow key={`${transfer.storeId}-${transfer.createdAt}`}>
                <TableCell>{transfer.storeName || "—"}</TableCell><TableCell>{money(transfer.amount)}</TableCell><TableCell>{transfer.status}</TableCell><TableCell>{transfer.settlementId || "Pending reconciliation"}</TableCell><TableCell>{transfer.createdAt ? new Date(transfer.createdAt).toLocaleString() : "—"}</TableCell>
              </TableRow>)}
                {!transfers.length && <TableRow><TableCell colSpan={5} align="center">No settlement requests found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Box>
        </>}

        {!loading && tab === 2 && <>
          <Paper component="form" onSubmit={runReconciliation} variant="outlined" sx={{ p: 2, maxWidth: 760 }}>
            <Typography variant="h6" mb={1}>Vendor reconciliation</Typography>
            <TextField {...inputProps} label="Cashfree vendor ID (optional)" value={recon.vendorId} onChange={(event) => setRecon({ ...recon, vendorId: event.target.value })} />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
              <TextField {...inputProps} type="datetime-local" label="Start date" InputLabelProps={{ shrink: true }} value={recon.startDate} onChange={(event) => setRecon({ ...recon, startDate: event.target.value })} />
              <TextField {...inputProps} type="datetime-local" label="End date" InputLabelProps={{ shrink: true }} value={recon.endDate} onChange={(event) => setRecon({ ...recon, endDate: event.target.value })} />
            </Box>
            <Button type="submit" variant="contained">Fetch reconciliation</Button>
          </Paper>
          {reconResult && <Paper variant="outlined" sx={{ mt: 2, p: 2, overflow: "auto", maxHeight: 560 }}><pre style={{ margin: 0 }}>{JSON.stringify(reconResult, null, 2)}</pre></Paper>}
        </>}
      </Paper>
    </MDBox>
  );
}
