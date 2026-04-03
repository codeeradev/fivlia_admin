import React, { useEffect, useState, useMemo } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { get, post } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function AddBanner() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null); // URL for preview
  const [imageFile, setImageFile] = useState(null); // actual File object
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [main, setMain] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [type, setType] = useState("");
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [mainId, setMainId] = useState("");
  const [subId, setSubId] = useState("");
  const [subsubId, setSubsubId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState([]);
  const [imageError, setImageError] = useState("");
  const [bannerType, setBannerType] = useState("normal");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await get(ENDPOINTS.GET_ALL_ZONE);
        const data = res.data;
        // Handle both old and new API response structures
        const cities = Array.isArray(data) ? data : data.result || data.data || [];
        setLocations(cities);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    const fetchBrands = async () => {
      try {
        const res = await get(ENDPOINTS.GET_BRANDS);
        const data = res.data;
        const brandList = Array.isArray(data) ? data : data.allBrands || data.allBrand || [];
        setBrands(brandList);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };

    fetchBrands();

    const fetchCategories = async () => {
      try {
        const res = await get(ENDPOINTS.GET_MAIN_CATEGORY);
        const data = res.data;
        // Handle both old and new API response structures
        const categories = Array.isArray(data) ? data : data.result || data.data || [];
        setMain(categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchLocations();
    fetchCategories();
  }, []);

  const selectedCity = useMemo(
    () => locations.filter((loc) => selectedCityId.includes(loc._id)),
    [locations, selectedCityId]
  );

  useEffect(() => {
    const selectedCitiesData = locations.filter((loc) => selectedCityId.includes(loc._id));

    let allZones = [];
    selectedCitiesData.forEach((city) => {
      if (city.zones) {
        allZones = [
          ...allZones,
          ...city.zones.map((z) => ({
            address: z.address,
            latitude: z.latitude,
            longitude: z.longitude,
            range: z.range,
          })),
        ];
      }
    });

    setZones(allZones);
  }, [selectedCityId, locations]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await get(ENDPOINTS.GET_ALL_STORE);
        const data = res.data;
        const storeList = Array.isArray(data) ? data : data.stores || [];
        setStores(storeList);
      } catch (err) {
        console.error("Error fetching stores:", err);
        setStores([]);
      }
    };

    fetchStores();
  }, []);

  // Image validation and preview
  const ImagePreview = (e) => {
    setImageError(""); // Reset error
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (under 500kb = 500 * 1024 bytes)
    if (file.size > 500 * 1024) {
      setImage(null);
      setImageFile(null);
      setImageError("Image size must be under 500 KB.");
      return;
    }

    // Check image dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width > 1280 || img.height > 540) {
        setImage(null);
        setImageFile(null);
        setImageError("Max 1280x540 px allowed.");
      } else {
        setImage(URL.createObjectURL(file));
        setImageFile(file);
        setImageError("");
      }
    };
  };

  const handleRemoveZone = (addressToRemove) => {
    setZones(zones.filter((zone) => zone.address !== addressToRemove));
  };

  const getShortAddress = (address) => {
    if (typeof address !== "string") return "";
    const parts = address.split(",");
    return parts.length > 1 ? `${parts[0]},${parts[1]}` : address;
  };

  const handleBanner = async () => {
    if (!name || !imageFile || !selectedCityId || zones.length === 0) {
      showAlert("error", "Please fill all required fields");
      return;
    }
    if (imageError) {
      showAlert("error", imageError);
      return;
    }

    const formData = new FormData();
    formData.append("title", name);
    formData.append("type", bannerType);
    formData.append("city", JSON.stringify(selectedCityId));
    formData.append("image", imageFile);
    formData.append("type2", type ? type : "NO");

    if (type === "Brand") {
      if (!selectedBrandId) {
        showAlert("error", "Please select a brand");
        return;
      }
      formData.append("brand", selectedBrandId);
    } else if (type === "Store") {
      if (!storeId) {
        showAlert("error", "Please select a store");
        return;
      }
      formData.append("storeId", storeId || "");
    } else {
      // Append category fields only if type is not Brand
      formData.append("mainCategory", mainId);
      formData.append("subCategory", subId);
      formData.append("subSubCategory", subsubId);
    }

    formData.append("zones", JSON.stringify(zones));

    try {
      showAlert("loading", "Saving banner...");
      const response = await post(ENDPOINTS.ADD_BANNER, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert("success", "Banner added successfully");
      navigate(-1);
    } catch (error) {
      console.error("Network or Server Error:", error);
      showAlert("error", "Failed to add banner");
    }
  };

  return (
    <MDBox
      p={{ xs: 1, sm: 1.5, md: 2 }}
      sx={{
        ml: { xs: 0, lg: miniSidenav ? "80px" : "250px" },
        transition: "margin-left 0.3s ease",
      }}
    >
      <div
        style={{
          width: "95%",
          margin: "0 auto",
          padding: "20px",
          borderRadius: "15px",
          border: "1px solid gray",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "green",
            fontWeight: "bold",
            marginBottom: "50px",
          }}
        >
          ADD NEW BANNER
        </h2>

        {/* Name */}
        <div style={formRowStyle}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            placeholder="Enter Banner Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Image */}
        <div style={formRowStyle}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ ...labelStyle, marginLeft: "30px" }}>Image </label>
            <span style={{ fontSize: "10px", marginLeft: "30px" }}>(Image must be 1280x540)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", width: "53%" }}>
            <input
              type="file"
              onChange={ImagePreview}
              style={{ ...inputStyle, marginRight: "20px" }}
              accept="image/*"
            />
            {image && (
              <img
                src={image}
                alt="preview"
                style={{
                  width: "238px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}
          </div>
        </div>
        {imageError && (
          <div
            style={{ marginLeft: "110px", color: "red", marginBottom: "15px", fontSize: "12px" }}
          >
            {imageError}
          </div>
        )}

        {/* City */}
        <div style={formRowStyle}>
          <label style={labelStyle}>City</label>
          <select
            style={inputStyle}
            value=""
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;

              // Add new city without removing old
              setSelectedCityId((prev) => {
                if (prev.includes(value)) return prev; // prevent duplicate
                return [...prev, value];
              });
            }}
          >
            <option value="">-- Select City --</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.city || loc.name || "Unknown City"}
              </option>
            ))}
          </select>
        </div>

        {/* Display Selected Zones */}
        {selectedCity && (
          <div style={formRowStyle}>
            <label style={labelStyle}>Selected Zones</label>
            <div style={{ width: "50%", marginRight: "20px" }}>
              {zones.length > 0 ? (
                <div style={tagsContainerStyle}>
                  {zones.map((zone, index) => (
                    <div
                      key={index}
                      style={{
                        ...tagStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title={`${zone.address} (Lat: ${zone.latitude}, Long: ${zone.longitude})`}
                    >
                      {getShortAddress(zone.address)}
                      <button
                        onClick={() => handleRemoveZone(zone.address)}
                        style={{
                          marginLeft: "8px",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "20px",
                          lineHeight: "1",
                          color: "red",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: "gray" }}>No zones available for this city.</span>
              )}
            </div>
          </div>
        )}

        {/* Type */}
        <div style={formRowStyle}>
          <label style={labelStyle}>Type</label>
          <select
            style={inputStyle}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setMainId("");
              setSubId("");
              setSubsubId("");
            }}
          >
            <option value="">--Select Type--</option>
            <option value="Store">Store/Seller</option>
            <option value="Brand">Brand</option>
            <option value="Category">Category</option>
            <option value="SubCategory">Sub-Category</option>
            <option value="Sub Sub-Category">Sub Sub-Category</option>
          </select>
        </div>

        {/* Banner Type */}
        <div style={formRowStyle}>
          <label style={labelStyle}>Banner Type</label>
          <select
            style={inputStyle}
            value={bannerType}
            onChange={(e) => setBannerType(e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="offer">Offer</option>
          </select>
        </div>

        {type === "Store" && (
          <div style={formRowStyle}>
            <label style={labelStyle}>Store/Seller</label>
            <select style={inputStyle} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              <option value="">--Select Store--</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.storeName} ({store.city?.name || "Unknown City"})
                </option>
              ))}
            </select>
          </div>
        )}

        {type === "Brand" && (
          <div style={formRowStyle}>
            <label style={labelStyle}>Select Brand</label>
            <select
              style={inputStyle}
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
            >
              <option value="">--Select Brand--</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.brandName || b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category / SubCategory / SubSubCategory */}
        {type === "Category" && (
          <div style={formRowStyle}>
            <label style={labelStyle}>Select Category</label>
            <select
              style={{ ...inputStyle, marginRight: "30px" }}
              value={mainId}
              onChange={(e) => setMainId(e.target.value)}
            >
              <option value="">--Select Category--</option>
              {main.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {type === "SubCategory" && (
          <>
            <div style={formRowStyle}>
              <label style={labelStyle}>Main Category</label>
              <select
                style={{ ...inputStyle, marginRight: "30px" }}
                value={mainId}
                onChange={(e) => {
                  setMainId(e.target.value);
                  setSubId("");
                }}
              >
                <option value="">--Select Main Category--</option>
                {main.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {mainId && (
              <div style={formRowStyle}>
                <label style={labelStyle}>Sub Category</label>
                <select
                  style={{ ...inputStyle, marginRight: "25px" }}
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                >
                  <option value="">--Select Sub Category--</option>
                  {(main.find((cat) => cat._id === mainId)?.subcat || []).map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {type === "Sub Sub-Category" && (
          <>
            <div style={formRowStyle}>
              <label style={labelStyle}>Main Category</label>
              <select
                style={{ ...inputStyle, marginRight: "30px" }}
                value={mainId}
                onChange={(e) => {
                  setMainId(e.target.value);
                  setSubId("");
                }}
              >
                <option value="">--Select Main Category--</option>
                {main.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {mainId && (
              <div style={formRowStyle}>
                <label style={labelStyle}>Sub Category</label>
                <select
                  style={{ ...inputStyle, marginRight: "30px" }}
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                >
                  <option value="">--Select Sub Category--</option>
                  {(main.find((cat) => cat._id === mainId)?.subcat || []).map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {subId && (
              <div style={formRowStyle}>
                <label style={labelStyle}>Sub Sub Category</label>
                <select
                  style={{ ...inputStyle, marginRight: "40px" }}
                  value={subsubId}
                  onChange={(e) => setSubsubId(e.target.value)}
                >
                  <option value="">--Select Sub Sub Category--</option>
                  {(
                    main.find((cat) => cat._id === mainId)?.subcat.find((sub) => sub._id === subId)
                      ?.subsubcat || []
                  ).map((subsub) => (
                    <option key={subsub._id} value={subsub._id}>
                      {subsub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Submit Buttons */}
        <div
          style={{
            display: "flex",
            gap: "50px",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "50px",
          }}
        >
          <Button
            variant="contained"
            style={{ backgroundColor: "#00c853", color: "white" }}
            onClick={handleBanner}
          >
            SAVE
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#00c853", color: "white" }}
            onClick={() => navigate(-1)}
          >
            BACK
          </Button>
        </div>
      </div>
    </MDBox>
  );
}

const formRowStyle = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  marginBottom: "25px",
};

const labelStyle = {
  fontWeight: "500",
};

const inputStyle = {
  width: "50%",
  height: "45px",
  padding: "8px",
  borderRadius: "10px",
  border: "0.5px solid black",
  backgroundColor: "white",
};

const tagsContainerStyle = {
  marginTop: "10px",
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const tagStyle = {
  backgroundColor: "white",
  padding: "6px 10px",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "14px",
  color: "black",
  boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
};

export default AddBanner;
