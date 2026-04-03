import React, { useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import "./Adduser.css";

function CreateUser() {
    const [controller] = useMaterialUIController();
    const { miniSidenav } = controller;
    const navigate = useNavigate();

    return (
        <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
            <div className="container">
                <h2 style={{ marginLeft: "95px" }}>Create User</h2>
                <div className="inner-div">
                    <div className="form-header">USER DETAILS</div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" placeholder="Insert First Name" />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" placeholder="Insert Last Name" />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="Insert Email" />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="Insert Password" />
                        </div>

                        {/* Phone Field with Dropdown */}
                        <div className="form-group">
                            <label>Phone</label>
                            <div className="phone-wrapper">
                                {/* <select className="country-code">
                                    <option value="+91">+91</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                    <option value="+971">+971</option>
                                </select> */}
                                <input
                                    type="text"
                                    placeholder="Insert Phone Number"
                                    className="phone-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Image</label>
                            <input type="file" />
                        </div>


                    </div>
                </div>
            </div>
        </MDBox>
    );
}

export default CreateUser;
