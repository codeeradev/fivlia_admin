import React, { useEffect, useState } from "react";
import "../../Wallet/Wallet.css";
import { FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import MDBox from "components/MDBox";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function StoreTransaction() {
    const location = useLocation();
  const { id } = location.state || {};  
  console.log("Got Store ID:", id);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const txnRes = await axios.get(`${process.env.REACT_APP_API_URL}/getStoreTransaction/${id}`);
        const txns = txnRes.data.storeData || [];

        // sort by latest
        const sortedTxns = txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sortedTxns);

        // set wallet balance = latest currentAmount
        if (sortedTxns.length > 0) {
          setWalletBalance(sortedTxns[0].currentAmount || 0);
        }
      } catch (err) {
        console.error("Failed to fetch store transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="loading-text">Loading transactions...</p>;

  // Calculate totals
  const totalCredits = transactions
    .filter((txn) => txn.type === "Credit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);
  const totalDebits = transactions
    .filter((txn) => txn.type === "Debit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  return (
    <MDBox ml={{ xs: "0", md: "250px" }} p={3} className="wallet-container">
      <div className="wallet-dashboard-container">
        <h2 className="dashboard-title">Store Wallet Overview</h2>
        <div className="card-grid">
          <div className="card green">
            <div className="card-header">
              <div className="icon"><FaWallet /></div>
              <div>
                <div className="card-title">Wallet Balance</div>
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
        
        {/* Transactions */}
        <div className="transactions-section">
          <h3 className="section-title">Recent Transactions</h3>
          {transactions.length > 0 ? (
            <ul className="transaction-list">
              {transactions.map((txn, idx) => (
                <li key={idx} className={`txn ${txn.type.toLowerCase()}`}>
                  <span className="txn-icon">
                    {txn.type === "Credit" ? <FaArrowDown color="#22c55e" /> : <FaArrowUp color="#ef4444" />}
                  </span>
                  <span className="txn-details">
                    <strong>{txn.description || "No description"}</strong>
                    <br />
                    <small>Order ID: {txn.orderId || "-"}</small>
                    <br />
                    <small>{new Date(txn.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</small>
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
