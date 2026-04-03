import React, { useEffect, useState} from "react";
import "./dashboard.css"
import { useNavigate } from "react-router-dom";
import './Table.css'
import axios from "axios";
import MDBox from "components/MDBox";
import { useMaterialUIController, setMiniSidenav } from "context";
import {
  FaMoneyBillWave, FaShoppingCart, FaBoxOpen, 
   FaTruck,  FaClipboardCheck, FaClipboardList,
} from "react-icons/fa";
import StoreOrder from "./StoreOrder";

export default function DashBoard() {
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const [stats, setStats] = useState(null)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMiniSidenav(dispatch, false); // Always keep it expanded
      } else {
        setMiniSidenav(dispatch, false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial run

    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

useEffect(()=>{
  const dashboardStats = async () => {
    try {
      const storeId = localStorage.getItem("storeId")
      const data =await axios.get(`${process.env.REACT_APP_API_URL}/getStoreDashboardStats/${storeId}`)
      setStats(data.data)
      
    } catch (error) {
      console.log(error);
      alert('An Error Occured')
    }
  }
  dashboardStats()
},[])

const data = stats ?[
  { title: "Total Earnings", value: stats.totalEarning, color: "green", icon: <FaMoneyBillWave />},
  { title: "Total Orders", value: stats.totalMonthlyOrders, color: "yellow", icon: <FaShoppingCart /> },
  { title: "Total Products", value: stats.totalProducts, color: "lightgreen", icon: <FaBoxOpen /> },
  { title: "Total Categories", value: stats.totalCategories, color: "indigo", icon: <FaTruck /> },
]:[];

const orderStatus = stats ? [
  { label: "Order Completed", value: stats.completedMonthlyOrders, color: "green", icon: <FaClipboardCheck /> },
  { label: "Order Pending", value: stats.pendingMonthlyOrders, color: "gray", icon: <FaClipboardList /> },
]:[];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMiniSidenav(dispatch, false); // Always keep it expanded
      } else {
        setMiniSidenav(dispatch, false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial run

    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  function handleEdit() {
    alert("This is not editable at this moment");
  }

  function handleDelete() {
    alert("This is not editable at this moment");
  }

  return (
    <MDBox 
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <div className="dashboard-container">
        <div className="card-grid">
          {data.map((item, index) => (
            <div
              key={index}
              className={`card ${item.color}`}
              onClick={() => navigate(item.link)}
            >
              <div className="card-header">
                <div className="icon">{item.icon}</div>
                <div>
                  <div className="card-title"><text style={{ color: 'black' }}>{item.title}</text></div>
                  <div className="card-value"><text style={{ color: 'black' }}>{item.value}</text></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-grid">
          {orderStatus.map((status, index) => (
            <div key={index} className="status-card">
              <div className="status-left">
                <span className={`status-label ${status.color}`}>
                  {status.icon} {status.label}
                </span>
              </div>
              <span className="status-value">{status.value}</span>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="recent-orders-section">
          <div className="recent-orders-header">
            <h3>Recent Orders</h3>
            <p>Latest 10 orders from your store</p>
          </div>
          <StoreOrder isDashboard={true}/>
          <div
            onClick={() => navigate('/store-orders')}
            className="view-all-link"
          >
            View All Orders →
          </div>
        </div>
      </div>
    </MDBox>
  );
}
