import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Switch,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Paper, Typography } from "@mui/material";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";
import { getAllTaxes } from "components/commonApi/commonApi";

function Setting() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [adminSignatureFile, setAdminSignatureFile] = useState(null);
  const [formData, setFormData] = useState({
    Owner_Name: "",
    Owner_Email: "",
    Owner_Number: "",
    GST_Number: "",
    Platform_Fee: 0,
    Description: "",
    Delivery_Charges: 0,
    Delivery_Charges_Gst: 0,
    // codLimit: 0,
    // minPrice: 0,
    // maxPrice: 0,
    // minWithdrawal: 0,
    PaymentGatewayStatus: false,
    activeGateway: "None",
    activeMode: "",
    RazorPayKey_test: "",
    RazorPayKey_live: "",
    RazorPayKey_secret: "",
    PhonePe_test: "",
    PhonePe_live: "",
    PhonePe_secret: "",
    Map_Api: {
      google: { api_key: "", status: false },
      apple: { api_key: "", status: false },
      ola: { api_key: "", status: false },
    },
    Auth: [
      {
        // firebase: { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "", measurementId: "", status: false },
        whatsApp: { appKey: "", authKey: "", status: false },
        bulksms: { api_id: "", api_password: "", status: false },
      },
    ],
    imageLink: "",
    // freeDeliveryLimit: 0,
    adminSignature: "",
  });
  const [taxOptions, setTaxOptions] = useState([]);

  useEffect(() => {
    const fetchTaxOptions = async () => {
      try {
        // showAlert("loading", "Loading taxes...");

        const response = await getAllTaxes();
        const result = response.data;

        let options = Array.isArray(result) ? result : result.result || [];
        setTaxOptions(
          options.map((tax) => ({
            display: tax.value || tax,
            value: parseFloat((tax.value || tax).replace("%", "")) || 0,
          }))
        );

        // showAlert("success", "Taxes loaded");
      } catch (error) {
        console.error("Error fetching tax options:", error);
        showAlert("error", "Failed to load taxes");
        setTaxOptions([]);
      }
    };
    fetchTaxOptions();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      showAlert("loading", "Loading settings...");

      try {
        const response = await get(ENDPOINTS.GET_SETTINGS);
        const result = response.data;
        if (result.settings) {
          const razorpayTest = result.settings.PaymentGateways?.RazorPayKey?.test || "";
          const razorpayLive = result.settings.PaymentGateways?.RazorPayKey?.live || "";
          const phonepeTest = result.settings.PaymentGateways?.PhonePe?.test || "";
          const phonepeLive = result.settings.PaymentGateways?.PhonePe?.live || "";
          let activeGateway = "None";
          let activeMode = "";
          if (razorpayTest) {
            activeGateway = "Razorpay";
            activeMode = "test";
          } else if (razorpayLive) {
            activeGateway = "Razorpay";
            activeMode = "live";
          } else if (phonepeTest) {
            activeGateway = "PhonePe";
            activeMode = "test";
          } else if (phonepeLive) {
            activeGateway = "PhonePe";
            activeMode = "live";
          }
          const mapApi = result.settings.Map_Api?.[0] || {
            google: { api_key: "", status: false },
            apple: { api_key: "", status: false },
            ola: { api_key: "", status: false },
          };
          setFormData({
            Owner_Name: result.settings.Owner_Name || "",
            Owner_Email: result.settings.Owner_Email || "",
            Owner_Number: result.settings.Owner_Number || "",
            GST_Number: result.settings.GST_Number || "",
            Platform_Fee: result.settings.Platform_Fee || 0,
            Description: result.settings.Description || "",
            Delivery_Charges: result.settings.Delivery_Charges || 0,
            Delivery_Charges_Gst: result.settings.Delivery_Charges_Gst || 0,
            // codLimit: result.settings.codLimit || 0,
            // minPrice: result.settings.minPrice || 0,
            // maxPrice: result.settings.maxPrice || 0,
            // minWithdrawal: result.settings.minWithdrawal || 0,
            PaymentGatewayStatus: result.settings.PaymentGatewayStatus || false,
            activeGateway,
            activeMode,
            RazorPayKey_test: razorpayTest,
            RazorPayKey_live: razorpayLive,
            RazorPayKey_secret: result.settings.PaymentGateways?.RazorPayKey?.secretKey || "",
            PhonePe_test: phonepeTest,
            PhonePe_live: phonepeLive,
            PhonePe_secret: result.settings.PaymentGateways?.PhonePe?.secretKey || "",
            Map_Api: {
              google: {
                api_key: mapApi.google?.api_key || "",
                status: mapApi.google?.status || false,
              },
              apple: {
                api_key: mapApi.apple?.api_key || "",
                status: mapApi.apple?.status || false,
              },
              ola: { api_key: mapApi.ola?.api_key || "", status: mapApi.ola?.status || false },
            },
            Auth:
              result.settings.Auth && result.settings.Auth.length > 0
                ? result.settings.Auth.map((auth) => ({
                    // firebase: {
                    //   apiKey: auth.firebase?.apiKey || "",
                    //   authDomain: auth.firebase?.authDomain || "",
                    //   projectId: auth.firebase?.projectId || "",
                    //   storageBucket: auth.firebase?.storageBucket || "",
                    //   messagingSenderId: auth.firebase?.messagingSenderId || "",
                    //   appId: auth.firebase?.appId || "",
                    //   measurementId: auth.firebase?.measurementId || "",
                    //   status: auth.firebase?.status || false
                    // },
                    whatsApp: {
                      appKey: auth.whatsApp?.appKey || "",
                      authKey: auth.whatsApp?.authKey || "",
                      status: auth.whatsApp?.status || false,
                    },
                    bulksms: {
                      api_id: auth.bulksms?.api_id || "",
                      api_password: auth.bulksms?.api_password || "",
                      status: auth.bulksms?.status || false,
                    },
                  }))
                : [
                    {
                      // firebase: {
                      //   apiKey: "",
                      //   authDomain: "",
                      //   projectId: "",
                      //   storageBucket: "",
                      //   messagingSenderId: "",
                      //   appId: "",
                      //   measurementId: "",
                      //   status: false
                      // },
                      whatsApp: { appKey: "", authKey: "", status: false },
                      bulksms: { api_id: "", api_password: "", status: false },
                    },
                  ],
            imageLink: result.settings.imageLink || "",
            // freeDeliveryLimit: result.settings.freeDeliveryLimit || 0,
            adminSignature: result.settings.adminSignature || "",
          });
          showAlert("success", "Settings loaded");
        } else {
          showAlert("error", result.message || "Failed to fetch settings");
        }
      } catch (error) {
        console.error("Fetch settings error =>", error);
        showAlert("error", "Something went wrong while fetching settings");
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [
        "Delivery_Charges",
        "Delivery_Charges_Gst",
        "Platform_Fee",
        // "codLimit",
        // "minPrice",
        // "maxPrice",
        // "minWithdrawal",
        // "freeDeliveryLimit"
      ].includes(field)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdminSignatureFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleGatewayChange = (gateway) => {
    setFormData((prev) => ({
      ...prev,
      activeGateway: gateway,
      activeMode: "",
    }));
  };

  const handleModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      activeMode: mode,
    }));
  };

  const handleMapApiKeyChange = (provider, value) => {
    setFormData((prev) => ({
      ...prev,
      Map_Api: {
        ...prev.Map_Api,
        [provider]: { ...prev.Map_Api[provider], api_key: value },
      },
    }));
  };

  const handleMapApiStatusChange = (provider) => {
    setFormData((prev) => ({
      ...prev,
      Map_Api: {
        google: { ...prev.Map_Api.google, status: provider === "google" },
        apple: { ...prev.Map_Api.apple, status: provider === "apple" },
        ola: { ...prev.Map_Api.ola, status: provider === "ola" },
      },
    }));
  };

  const handleAuthStatusChange = (provider, checked) => {
    setFormData((prev) => ({
      ...prev,
      Auth: [
        {
          ...prev.Auth[0],
          whatsApp: {
            ...prev.Auth[0].whatsApp,
            status: provider === "whatsApp" ? checked : false,
          },
          bulksms: {
            ...prev.Auth[0].bulksms,
            status: provider === "bulksms" ? checked : false,
          },
        },
      ],
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    showAlert("loading", "Updating settings...");

    try {
      // Step 1: Filter out UI-only fields
      const filteredData = { ...formData };
      delete filteredData.activeGateway;
      delete filteredData.activeMode;

      // Step 2: Build PaymentGateways object
      filteredData.PaymentGateways = {};

      if (formData.activeGateway === "Razorpay") {
        filteredData.PaymentGateways.RazorPayKey = {
          test: formData.RazorPayKey_test || "",
          live: formData.RazorPayKey_live || "",
          secretKey: formData.RazorPayKey_secret || "",
          status: true,
          activeMode: formData.activeMode,
        };
        filteredData.PaymentGateways.PhonePe = {
          test: formData.PhonePe_test || "",
          live: formData.PhonePe_live || "",
          secretKey: "",
          status: false,
        };
      } else if (formData.activeGateway === "PhonePe") {
        filteredData.PaymentGateways.PhonePe = {
          test: formData.PhonePe_test || "",
          live: formData.PhonePe_live || "",
          secretKey: formData.PhonePe_secret || "",
          status: true,
          activeMode: formData.activeMode,
        };
        filteredData.PaymentGateways.RazorPayKey = {
          test: formData.RazorPayKey_test || "",
          live: formData.RazorPayKey_live || "",
          secretKey: "",
          status: false,
        };
      } else {
        filteredData.PaymentGateways = {
          RazorPayKey: { test: "", live: "", secretKey: "", status: false },
          PhonePe: { test: "", live: "", secretKey: "", status: false },
        };
      }

      // Step 3: Ensure Map_Api array structure
      filteredData.Map_Api = [
        {
          google: {
            api_key: formData.Map_Api.google.api_key || "",
            status: formData.Map_Api.google.status || false,
          },
          apple: {
            api_key: formData.Map_Api.apple.api_key || "",
            status: formData.Map_Api.apple.status || false,
          },
          ola: {
            api_key: formData.Map_Api.ola.api_key || "",
            status: formData.Map_Api.ola.status || false,
          },
        },
      ];

      // Step 4: Ensure Auth array is correct, preserving all fields including firebase
      filteredData.Auth = formData.Auth.map((auth) => ({
        // firebase: {
        //   apiKey: auth.firebase?.apiKey || "",
        //   authDomain: auth.firebase?.authDomain || "",
        //   projectId: auth.firebase?.projectId || "",
        //   storageBucket: auth.firebase?.storageBucket || "",
        //   messagingSenderId: auth.firebase?.messagingSenderId || "",
        //   appId: auth.firebase?.appId || "",
        //   measurementId: auth.firebase?.measurementId || "",
        //   status: auth.firebase?.status || false
        // },
        whatsApp: {
          appKey: auth.whatsApp.appKey || "",
          authKey: auth.whatsApp.authKey || "",
          status: auth.whatsApp.status || false,
        },
        bulksms: {
          api_id: auth.bulksms.api_id || "",
          api_password: auth.bulksms.api_password || "",
          status: auth.bulksms.status || false,
        },
      }));

      // Step 5: Delete temporary fields
      delete filteredData.RazorPayKey_test;
      delete filteredData.RazorPayKey_live;
      delete filteredData.PhonePe_test;
      delete filteredData.PhonePe_live;
      delete filteredData.PhonePe_secret;

      // let fetchOptions = {};
      // let url = `${process.env.REACT_APP_API_URL}/adminSetting`;
      let response;

      if (adminSignatureFile) {
        // Step 6a: File exists → use FormData
        const form = new FormData();
        form.append("payload", JSON.stringify(filteredData));
        form.append("image", adminSignatureFile);
        response = await put(ENDPOINTS.ADMIN_SETTING, form);
      } else {
        // Step 6b: No file → send JSON
        response = await put(ENDPOINTS.ADMIN_SETTING, filteredData);
      }

      // Step 7: Make request
      const result = response.data;

      // Success alert
      showAlert("success", "Settings updated successfully");

      setFormData((prev) => ({
        ...prev,
        adminSignature: result.settings?.adminSignature || prev.adminSignature,
      }));
    } catch (error) {
      console.error("Update error:", error);
      showAlert("error", "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <div className="store-container">
        <div className="store-header">Personal Details</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Owner Name</label>
              <input
                type="text"
                value={formData.Owner_Name}
                onChange={(e) => handleInputChange("Owner_Name", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Owner Email</label>
              <input
                type="email"
                value={formData.Owner_Email}
                onChange={(e) => handleInputChange("Owner_Email", e.target.value)}
              />
            </div>
          </div>
          <div className="store-row">
            <div className="store-input">
              <label>Mobile Number</label>
              <input
                type="number"
                value={formData.Owner_Number}
                onChange={(e) => handleInputChange("Owner_Number", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>GST Number</label>
              <input
                type="text"
                value={formData.GST_Number}
                onChange={(e) => handleInputChange("GST_Number", e.target.value)}
              />
            </div>
          </div>
          <div className="store-row">
            <div className="store-input">
              <label>Platform Fee (%)</label>
              <input
                type="number"
                value={formData.Platform_Fee}
                onChange={(e) => handleInputChange("Platform_Fee", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Admin Signature</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div style={{ minHeight: "108px" }}>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Admin Signature Preview"
                    style={{ maxWidth: "100px", marginTop: "8px", display: "block" }}
                  />
                ) : formData.adminSignature ? (
                  <img
                    src={`${process.env.REACT_APP_IMAGE_LINK}${formData.adminSignature}`}
                    alt="Admin Signature"
                    style={{ maxWidth: "100px", marginTop: "8px", display: "block" }}
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className="store-row">
            <div className="store-input" style={{ flex: "1 1 100%" }}>
              <label>Image Link</label>
              <input
                type="text"
                value={formData.imageLink || ""}
                onChange={(e) => handleInputChange("imageLink", e.target.value)}
              />
            </div>
          </div>
          <div className="store-row">
            <div className="store-input" style={{ flex: "1 1 100%" }}>
              <label>Description</label>
              <textarea
                rows={4}
                value={formData.Description}
                onChange={(e) => handleInputChange("Description", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="store-container">
        <div className="store-header">Delivery Details</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Delivery Charges</label>
              <input
                type="number"
                value={formData.Delivery_Charges}
                onChange={(e) => handleInputChange("Delivery_Charges", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Delivery Charges GST</label>
              <Select
                fullWidth
                value={
                  taxOptions.find((option) => option.value === formData.Delivery_Charges_Gst)
                    ?.display || ""
                }
                onChange={(e) => {
                  const selectedOption = taxOptions.find(
                    (option) => option.display === e.target.value
                  );
                  handleInputChange(
                    "Delivery_Charges_Gst",
                    selectedOption ? selectedOption.value : 0
                  );
                }}
                style={{ height: "37px" }}
              >
                {taxOptions.map((tax) => (
                  <MenuItem key={tax.value} value={tax.display}>
                    {tax.display}
                  </MenuItem>
                ))}
              </Select>
            </div>
            {/* <div className="store-input" style={{ flex: "1 1 33%" }}>
              <label>COD Limit</label>
              <input
                type="number"
                value={formData.codLimit}
                onChange={(e) => handleInputChange("codLimit", e.target.value)}
              />
            </div> */}
          </div>
          {/* <div className="store-row">
            <div className="store-input">
              <label>Minimum Item Price</label>
              <input
                type="number"
                value={formData.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Maximum Item Price</label>
              <input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
              />
            </div>
          </div>
          <div className="store-row">
            <div className="store-input">
              <label>Minimum Withdrawal</label>
              <input
                type="number"
                value={formData.minWithdrawal}
                onChange={(e) => handleInputChange("minWithdrawal", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Free Delivery Limit</label>
              <input
                type="number"
                value={formData.freeDeliveryLimit}
                onChange={(e) => handleInputChange("freeDeliveryLimit", e.target.value)}
              />
            </div>
          </div> */}
        </div>
      </div>

      <div className="store-container">
        <div className="store-header">Payment Gateway</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Enable Payment Gateway</label>
              <Switch
                checked={formData.PaymentGatewayStatus}
                onChange={(e) => handleInputChange("PaymentGatewayStatus", e.target.checked)}
              />
            </div>
          </div>
          <div className="store-row">
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Payment Gateway</FormLabel>
              <RadioGroup
                row
                value={formData.activeGateway}
                onChange={(e) => handleGatewayChange(e.target.value)}
              >
                <FormControlLabel value="Razorpay" control={<Radio />} label="Razorpay" />
                <FormControlLabel value="PhonePe" control={<Radio />} label="PhonePe" />
                <FormControlLabel value="None" control={<Radio />} label="None" />
              </RadioGroup>
            </FormControl>
          </div>
          {(formData.activeGateway === "Razorpay" || formData.activeGateway === "PhonePe") && (
            <div className="store-row">
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Mode</FormLabel>
                <RadioGroup
                  row
                  value={formData.activeMode}
                  onChange={(e) => handleModeChange(e.target.value)}
                >
                  <FormControlLabel value="test" control={<Radio />} label="Test" />
                  <FormControlLabel value="live" control={<Radio />} label="Live" />
                </RadioGroup>
              </FormControl>
            </div>
          )}
          {formData.activeGateway === "Razorpay" && formData.activeMode && (
            <>
              <div className="store-row">
                <div className="store-input">
                  <label>{`Razorpay ${
                    formData.activeMode === "test" ? "Test" : "Live"
                  } Key`}</label>
                  <input
                    type="text"
                    value={
                      formData.activeMode === "test"
                        ? formData.RazorPayKey_test
                        : formData.RazorPayKey_live
                    }
                    onChange={(e) =>
                      handleInputChange(
                        formData.activeMode === "test" ? "RazorPayKey_test" : "RazorPayKey_live",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <div className="store-row">
                <div className="store-input">
                  <label>{`Razorpay ${
                    formData.activeMode === "test" ? "Test" : "Live"
                  } Secret Key`}</label>
                  <input
                    type="text"
                    value={formData.RazorPayKey_secret}
                    onChange={(e) => handleInputChange("RazorPayKey_secret", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          {formData.activeGateway === "PhonePe" && formData.activeMode && (
            <>
              <div className="store-row">
                <div className="store-input">
                  <label>{`PhonePe ${formData.activeMode === "test" ? "Test" : "Live"} Key`}</label>
                  <input
                    type="text"
                    value={
                      formData.activeMode === "test" ? formData.PhonePe_test : formData.PhonePe_live
                    }
                    onChange={(e) =>
                      handleInputChange(
                        formData.activeMode === "test" ? "PhonePe_test" : "PhonePe_live",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <div className="store-row">
                <div className="store-input">
                  <label>{`PhonePe ${
                    formData.activeMode === "test" ? "Test" : "Live"
                  } Secret Key`}</label>
                  <input
                    type="text"
                    value={formData.PhonePe_secret}
                    onChange={(e) => handleInputChange("PhonePe_secret", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="store-container">
        <div className="store-header">Map API Keys</div>
        <div className="store-form">
          <RadioGroup
            row
            name="mapApiStatus"
            value={["google", "apple", "ola"].find((p) => formData.Map_Api[p].status) || ""}
            onChange={(e) => handleMapApiStatusChange(e.target.value)}
          >
            {["google", "apple", "ola"].map((provider) => (
              <Paper
                key={provider}
                elevation={2}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px",
                  marginBottom: "16px",
                  width: "100%",
                  gap: "16px",
                }}
              >
                <FormControlLabel
                  value={provider}
                  control={<Radio color="primary" />}
                  label={
                    <Typography
                      variant="subtitle1"
                      style={{ textTransform: "capitalize", fontWeight: 600 }}
                    >
                      {provider}
                    </Typography>
                  }
                  style={{ marginRight: "24px" }}
                />
                <input
                  type="text"
                  placeholder={`Enter ${provider} API Key`}
                  value={formData.Map_Api[provider].api_key}
                  onChange={(e) => handleMapApiKeyChange(provider, e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "15px",
                  }}
                />
                {formData.Map_Api[provider].status && (
                  <span style={{ color: "#00c853", fontWeight: 500, marginLeft: 12 }}>
                    (Active)
                  </span>
                )}
              </Paper>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="store-container">
        <div className="store-header">Authentication</div>
        <div className="store-form">
          <RadioGroup
            row
            name="authStatus"
            value={["whatsApp", "bulksms"].find((p) => formData.Auth[0][p].status) || ""}
            onChange={(e) => handleAuthStatusChange(e.target.value, true)}
          >
            <div style={{ display: "flex", marginLeft: "50px", gap: "46px", flexWrap: "wrap" }}>
              {["whatsApp", "bulksms"].map((provider) => (
                <Paper
                  key={provider}
                  elevation={2}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    width: "300px",
                    gap: "16px",
                  }}
                >
                  <FormControlLabel
                    value={provider}
                    control={<Radio color="primary" />}
                    label={
                      <Typography
                        variant="subtitle1"
                        style={{ textTransform: "capitalize", fontWeight: 600 }}
                      >
                        {provider === "whatsApp" ? "WhatsApp" : "BulkSMS"}
                      </Typography>
                    }
                    style={{ marginRight: "24px" }}
                  />
                  {formData.Auth[0][provider].status && (
                    <span style={{ color: "#00c853", fontWeight: 500, marginLeft: 12 }}>
                      (Active)
                    </span>
                  )}
                </Paper>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>
      <div style={{ display: "flex", gap: "30px", alignItems: "center", justifyContent: "center" }}>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#00c853",
            color: "white",
            fontSize: "15px",
            padding: "8px 24px",
          }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          SAVE
        </Button>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#00c853",
            color: "white",
            fontSize: "15px",
            padding: "8px 24px",
          }}
          onClick={() => navigate(-1)}
        >
          BACK
        </Button>
      </div>
    </MDBox>
  );
}

export default Setting;
