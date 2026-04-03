import React, { useEffect, useState } from "react";
import "./Wallet.css";
import { FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import MDBox from "components/MDBox";
import { FaDownload } from "react-icons/fa";
import { showAlert } from "components/commonFunction/alertsLoader";
import { useMaterialUIController } from "context";
import { get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const fetchData = async () => {
    try {
      showAlert("loading", "Fetching Wallet data...");
      const walletRes = await get(ENDPOINTS.WALLET_ADMIN);
      setWallet(walletRes.data);
      // Transactions
      const query = new URLSearchParams();

      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);

      const txnRes = await get(`${ENDPOINTS.ADMIN_TRANSACTION}?${query.toString()}`);
      const sortedTxns = txnRes.data.transactions
        .filter((txn) => txn.createdAt) // ignore incomplete entries
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(sortedTxns);
      showAlert("info", "", 1);
    } catch (err) {
      console.error("Failed to fetch wallet data", err);
      showAlert("error", "Failed to fetch wallet stats.");
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const downloadCSV = () => {
    if (!transactions.length) {
      showAlert("info", "No transactions to export");
      return;
    }

    const headers = ["Order ID", "Seller", "Type", "Amount", "Description", "City", "Date"];

    const rows = transactions.map((txn) => [
      txn.orderId || "",
      txn.storeName || "",
      txn.type || "",
      txn.amount || 0,
      txn.description || "",
      txn.city || "",
      new Date(txn.createdAt).toLocaleString("en-IN"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `wallet-transactions-${Date.now()}.csv`;
    link.click();
  };

  // Calculate total credits/debits from transactions
  const totalCredits = transactions
    .filter((txn) => txn.type === "Credit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);
  const totalDebits = transactions
    .filter((txn) => txn.type === "Debit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  return (
    <MDBox ml={{ xs: "0", md: miniSidenav ? "80px" : "250px" }} p={3} className="wallet-container">
      <div className="wallet-dashboard-container">
        <h2 className="dashboard-title">Wallet Overview</h2>
        <div className="card-grid">
          <div className="card green">
            <div className="card-header">
              <div className="icon">
                <FaWallet />
              </div>
              <div>
                <div className="card-title">Wallet Balance</div>
                <div className="card-value">₹{wallet?.totalCash.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="card blue">
            <div className="card-header">
              <div className="icon">
                <FaArrowDown />
              </div>
              <div>
                <div className="card-title">Total Credits</div>
                <div className="card-value">₹{totalCredits.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="card red">
            <div className="card-header">
              <div className="icon">
                <FaArrowUp />
              </div>
              <div>
                <div className="card-title">Total Debits</div>
                <div className="card-value">₹{totalDebits.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Transactions */}
        <div className="transactions-section">
          <div className="transactions-header">
            <h3 className="section-title">Recent Transactions</h3>
            <div className="transaction-actions">
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <button className="btn-outline" onClick={fetchData}>
                Apply
              </button>

              <button className="btn-ghost" onClick={downloadCSV}>
                <FaDownload /> Download CSV
              </button>
            </div>
          </div>
          {transactions.length > 0 ? (
            <ul className="transaction-list">
              {transactions.map((txn, idx) => (
                <li key={idx} className={`txn ${txn.type.toLowerCase()}`}>
                  <span className="txn-icon">
                    {txn.type === "Credit" ? (
                      <FaArrowDown color="#22c55e" />
                    ) : (
                      <FaArrowUp color="#ef4444" />
                    )}
                  </span>
                  <span className="txn-details">
                    <strong>{txn.description || "No description"}</strong>
                    <br />
                    <small>Order ID: {txn.orderId || "-"}</small>
                    <br />
                    <small>Seller: {txn.storeName || "-"}</small>
                    <br />
                    <small>City: {txn.city || "-"}</small>
                    <br />
                    <small>
                      {new Date(txn.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </small>
                  </span>
                  <span className={`txn-amount ${txn.type.toLowerCase()}`}>
                    {txn.type === "Credit" ? "+" : "-"}₹{(txn.amount || 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-transactions">No transactions found</p>
          )}
        </div>
      </div>
    </MDBox>
  );
}
