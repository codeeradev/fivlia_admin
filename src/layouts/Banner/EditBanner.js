import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { get, patch } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function EditBanner() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const location = useLocation();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [main, setMain] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [type, setType] = useState("");
  const [mainId, setMainId] = useState("");
  const [subId, setSubId] = useState("");
  const [subsubId, setSubsubId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  // Load initial data from location.state and fetch locations & categories
  useEffect(() => {
    const data = location.state;
    if (data) {
      setId(data._id);
      setName(data.title);
      setSelectedCityId(Array.isArray(data.city) ? data.city.map((c) => c._id) : [data.city?._id]);
      if (Array.isArray(data.zones)) {
        setZones(
          data.zones.map((z) => ({
            address: z.address,
            latitude: z.latitude,
            longitude: z.longitude,
            range: z.range,
          }))
        );
      }
      setType(data.type2 || "");

      if (data.brand && data.brand._id) {
        setBrandId(data.brand._id);
      } else {
        setBrandId("");
      }

      if (data.mainCategory && data.mainCategory._id) {
        setMainId(data.mainCategory._id);
      } else {
        setMainId("");
      }

      if (data.subCategory && data.subCategory._id) {
        setSubId(data.subCategory._id);
      } else {
        setSubId("");
      }

      if (data.subSubCategory && data.subSubCategory._id) {
        setSubsubId(data.subSubCategory._id);
      } else {
        setSubsubId("");
      }

      if (data.storeId) {
        setStoreId(data.storeId);
      } else {
        setStoreId("");
      }

      if (data.image) {
        setImage(data.image);
        setImagePreview(`${process.env.REACT_APP_IMAGE_LINK}${data.image}`);
      } else {
        setImage(null);
        setImagePreview(null);
      }
    }

    const fetchBrands = async () => {
      try {
        const res = await get(ENDPOINTS.GET_BRANDS);
        const data = res.data;
        setBrands(data.allBrands || []);
      } catch (err) {
        console.error("Error fetching brands:", err);
        showAlert("error", "Error fetching locations");
      }
    };

    fetchBrands();

    const fetchLocations = async () => {
      try {
        const res = await get(ENDPOINTS.GET_ALL_ZONE);
        const data = res.data;
        const cities = Array.isArray(data) ? data : data.result || data.data || [];
        setLocations(cities);
      } catch (err) {
        console.error("Error fetching locations:", err);
        showAlert("error", "Error fetching locations");
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await get(ENDPOINTS.GET_MAIN_CATEGORY);
        setMain(res.data.result || []);
        setMain(data.result || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        showAlert("error", "Error fetching categories");
      }
    };

    fetchLocations();
    fetchCategories();
  }, [location.state]);

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

  // Fetch stores when zones change
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await get(ENDPOINTS.GET_ALL_STORE);
        const data = res.data;
        const storeList = Array.isArray(data) ? data : data.stores || [];
        setStores(storeList);
      } catch (err) {
        console.error("Error fetching stores:", err);
        showAlert("error", "Error fetching stores");
        setStores([]);
      }
    };

    fetchStores();
  }, []);

  // Image preview handler
  const ImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove zone handler
  const handleRemoveZone = (addressToRemove) => {
    setZones(zones.filter((zone) => zone.address !== addressToRemove));
  };

  // Shorten address for display
  const getShortAddress = (address) => {
    if (typeof address !== "string") return "";
    const parts = address.split(",");
    return parts.length > 1 ? `${parts[0]},${parts[1]}` : address;
  };

  // Handle banner save
  const handleBanner = async () => {
    if (!name || !type || !selectedCityId || zones.length === 0) {
      showAlert("error", "Please fill all required fields.");
      return;
    }

    // Get the file input element and selected file
    const imageFile = document.querySelector('input[type="file"]').files[0];

    // If no new image file selected and no existing image, alert
    if (!imageFile && !image) {
      showAlert("error", "Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", name);
    formData.append("city", JSON.stringify(selectedCityId));
    formData.append("type", type);
    formData.append("type2", type);
    if (type === "Brand") {
      if (!brandId) return showAlert("error", "Please select a brand for Brand type banners.");
      formData.append("brand", brandId);
    } else if (type === "Store") {
      if (!storeId) return showAlert("error", "Please select a Store for Store type banners..");
      formData.append("storeId", storeId);
    } else {
      if (mainId) formData.append("mainCategory", mainId);
      if (subId) formData.append("subCategory", subId);
      if (subsubId) formData.append("subSubCategory", subsubId);
    }
    formData.append("storeId", storeId || "");
    zones.forEach((zone, index) => {
      formData.append(`zones[${index}][address]`, zone.address);
      formData.append(`zones[${index}][latitude]`, zone.latitude);
      formData.append(`zones[${index}][longitude]`, zone.longitude);
      if (zone.range) {
        formData.append(`zones[${index}][range]`, zone.range);
      }
    });

    // If new image selected, append the new file
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (image && typeof image === "string") {
      formData.append("existingImage", image);
    }

    try {
      showAlert("loading", "Updating banner...");

      await patch(`${ENDPOINTS.UPDATE_BANNER}/${id}/status`, formData);

      showAlert("success", "Banner updated successfully");

      navigate(-1);
    } catch (error) {
      showAlert("error", "Failed to update banner");
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
          UPDATE BANNER
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
          <label style={labelStyle}>Image</label>
          <div style={{ display: "flex", alignItems: "center", width: "50%" }}>
            <input
              type="file"
              onChange={ImagePreview}
              style={{ ...inputStyle, marginRight: "20px" }}
              accept="image/*"
            />
            {imagePreview && (
              <img
                src={imagePreview}
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

        {/* City */}
        <div style={formRowStyle}>
          <label style={labelStyle}>City</label>
          <select
            style={inputStyle}
            value=""
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;

              setSelectedCityId((prev) => (prev.includes(value) ? prev : [...prev, value]));
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
        {selectedCityId && (
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
              setBrandId("");
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
            <select style={inputStyle} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              <option value="">--Select Brand--</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.brandName}
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

export default EditBanner;
