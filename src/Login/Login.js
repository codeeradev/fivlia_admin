import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginPage.css";
import { showAlert } from "components/commonFunction/alertsLoader";
import { post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import routes from "routes";
import logo from "./fivlialogo.png";
import getFirstAllowedRoute from "components/RoleBaseFunction/firstAllowedRoute";
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // Step 1 = credentials, Step 2 = OTP
  const navigate = useNavigate();

  // 🔍 Find the first route user has permission for

  const handleLogin = async (e) => {
    e.preventDefault();

    // Step 1️⃣ — Username + Password check
    // if (step === 1) {
    //   if (username === "fivlia" && password === "fivlia@123") {
    //     setStep(2); // move to OTP screen
    //     showAlert("info", "Enter the 6-digit OTP from Google Authenticator");
    //   } else {
    //     showAlert("error", "Invalid username or password");
    //   }
    // }
    // Step 2️⃣ — Verify OTP with backend
    // else {
    try {
      showAlert("loading", "Verifying credentials...");
      const res = await post(ENDPOINTS.ADMIN_LOGIN, { username, password, otp, step });
      const data = res.data;

      // if (res.ok) {
      // const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 30 minutes
      // localStorage.setItem("adminAuth", "true");
      // localStorage.setItem("sessionExpiry", expiryTime);
      // showAlert("success", "Login successful! Redirecting...");
      // navigate("/dashboard",{ replace: true });
      // } else {
      //   showAlert("error", data.message || "Invalid OTP");
      // }

      if (data.requiresOTP === true && step === 1) {
        setStep(2);
        showAlert("info", "Enter the OTP from Google Authenticator");
        return;
      }
      if (data.user) {
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 30 minutes
        // Save user and permissions
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("sessionExpiry", expiryTime);
        localStorage.setItem("token", data.user.jwttoken);
        showAlert("success", "Login successful!");
        const allowedRoute = getFirstAllowedRoute(routes, data.user.permissions);

        return navigate(allowedRoute, { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 400 || err.response?.status === 401) {
        return showAlert("error", err.response.data.message);
      }

      showAlert("error", "Server error during login");
    }
    // }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <img
            src={logo}
            alt="Fivlia Logo"
            style={{
              width: "130px",
              display: "flex",
              justifyContent: "center",
              alignSelf: "center",
            }}
          />
          <h2>Admin Login</h2>

          {step === 1 ? (
            <>
              {/* Step 1 → Username and Password */}
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Step 2 → OTP from Google Authenticator */}
              <p>Enter the 6-digit OTP from Google Authenticator:</p>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </>
          )}

          <button type="submit">{step === 1 ? "Next" : "Verify & Login"}</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
