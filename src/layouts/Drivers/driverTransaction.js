import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../Wallet/Wallet.css";
import { FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import MDBox from "components/MDBox";
import { get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

export default function DriverTransaction() {
  const { state } = useLocation();
  const driverId = state?.driverId || "";
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!driverId) {
        setError("No driver ID provided");
        setLoading(false);
        return;
      }

      try {
        const txnRes = await get(`${ENDPOINTS.GET_DRIVER_TRANSACTIONS}/${driverId}`);
        const sortedTxns = txnRes.data.transactionList
          .filter((txn) => txn.createdAt)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sortedTxns);
        setWalletBalance(txnRes.data.totalAmount || 0);
      } catch (err) {
        console.error("Failed to fetch driver transaction data", err);
        setError("Failed to load transactions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [driverId]);

  if (loading) return <p className="loading-text">Loading transactions...</p>;
  if (error) return <p className="error-text">{error}</p>;

  const totalCredits = transactions
    .filter((txn) => txn.type.toLowerCase() === "credit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);
  const totalDebits = transactions
    .filter((txn) => txn.type.toLowerCase() === "debit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  return (
    <MDBox ml={{ xs: "0", md: "250px" }} p={3} className="wallet-container">
      <div className="wallet-dashboard-container">
        <h2 className="dashboard-title">Driver Transaction Overview</h2>
        <div className="card-grid">
          <div className="card green">
            <div className="card-header">
              <div className="icon"><FaWallet /></div>
              <div>
                <div className="card-title">Driver Balance</div>
                <div className="card-value">₹{walletBalance.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="card blue">
            <div className="card-header">
              <div className="icon"><FaArrowDown /></div>
              <div>
                <div className="card-title">Total Credits</div>
                <div className="card-value">₹{totalCredits.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="card red">
            <div className="card-header">
              <div className="icon"><FaArrowUp /></div>
              <div>
                <div className="card-title">Total Debits</div>
                <div className="card-value">₹{totalDebits.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="transactions-section">
          <h3 className="section-title">Recent Transactions</h3>
          {transactions.length > 0 ? (
            <ul className="transaction-list">
              {transactions.map((txn, idx) => (
                <li key={idx} className={`txn ${txn.type.toLowerCase()}`}>
                  <span className="txn-icon">
                    {txn.type.toLowerCase() === "credit" ? (
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
                    <small>
                      {new Date(txn.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </small>
                  </span>
                  <span className={`txn-amount ${txn.type.toLowerCase()}`}>
                    {txn.type.toLowerCase() === "credit" ? "+" : "-"}₹{(txn.amount || 0).toFixed(2)}
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