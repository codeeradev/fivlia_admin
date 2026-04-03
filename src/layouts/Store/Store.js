import React from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function StoreList() {
    const [controller] = useMaterialUIController();
    const { miniSidenav } = controller;
    const navigate=useNavigate();

    const stats = [
        {
            count: 10,
            label: "Total Stores",
            bgColor: "#d6efff",
            icon: "🏬",
        },
        {
            count: 9,
            label: "Active stores",
            bgColor: "#fff1e4",
            icon: "🏪",
        },
        {
            count: 1,
            label: "Inactive stores",
            bgColor: "#e5f7e6",
            icon: "🟪",
        },
        {
            count: 0,
            label: "Newly joined stores",
            bgColor: "#fde6f4",
            icon: "🆕",
        },
    ];

    return (
        <MDBox
            p={2}
            style={{
                marginLeft: miniSidenav ? "80px" : "250px",
                transition: "margin-left 0.3s ease",
            }}
        >
            <div style={{ padding: '20px' }}>

                 {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                        flexWrap: "wrap",
                        marginTop:'30px',
                        padding:'20px',
                        backgroundColor:'white',
                        borderRadius:"20px"
                    }}
                >
                    <div>
                        <span style={{ fontWeight: "bold", fontSize: 26 }}>Store Lists</span>
                        <br />
                        <span style={{ fontSize: 17 }}>View and manage all stores</span>
                    </div>
                    <div>
                        <Button
                            style={{
                                backgroundColor: "#00c853",
                                height: 50,
                                width: 170,
                                fontSize: 13,
                                color: "white",
                                letterSpacing: "1px",
                            }}
                            onClick={()=>navigate('/add-store')}
                        >
                            + Create Store
                        </Button>
                    </div>
                </div>

                <div style={{
                    display: "flex", gap: "20px", flexWrap: "wrap", padding: '20px', justifyContent: 'center',
                    alignItems: 'center', backgroundColor: 'white', borderRadius: '20px'
                }}>
                    {stats.map((item, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: item.bgColor,
                                borderRadius: "16px",
                                padding: "20px",
                                width: "250px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold" }}>{item.count}</div>
                                <div style={{ fontSize: "16px", marginTop: "4px" }}>{item.label}</div>
                            </div>
                            <div style={{ fontSize: "40px" }}>{item.icon}</div>
                        </div>
                    ))}
                </div>
               
            </div>
        </MDBox>
    );
}

export default StoreList;
