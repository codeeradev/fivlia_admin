import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { post, get } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

function AddBrand() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false); // New state for featured
  const [typeId, setTypeId] = useState("");
  const [brandTypes, setBrandTypes] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await get(ENDPOINTS.GET_TYPE);
        setBrandTypes(res.data || []);
      } catch (err) {
        console.error("Error fetching brand types:", err);
        showAlert("error", "Failed to load types");
      }
    };

    fetchTypes();
  }, []);

  const ImagePreview = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleBrands = async () => {
    try {
      if (!name.trim()) {
        showAlert("warning", "Please enter a brand name before continuing.");
        return;
      }

      if (!imageFile) {
        showAlert("warning", "Please upload a brand image before continuing.");
        return;
      }

      if (!typeId) {
        showAlert("warning", "Please select a type before adding the brand.");
        return;
      }

      showAlert("loading", "Creating brand...");
      const formData = new FormData();
      formData.append("brandName", name.trim());
      formData.append("description", description);
      formData.append("image", imageFile);
      formData.append("featured", featured.toString()); // Added featured field
      formData.append("typeId", typeId);

      await post(ENDPOINTS.ADD_BRAND, formData);

      showAlert("success", "Brand created successfully");
      navigate(-1);
    } catch (err) {
      console.error(err);
      showAlert("error", err?.response?.data?.message || "Failed to add brand");
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "20px" }}>
      <div
        style={{
          width: "85%",
          margin: "0 auto",
          borderRadius: "10px",
          padding: "10px",
          border: "1px solid gray",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontWeight: "bold",
            color: "green",
          }}
        >
          ADD NEW BRAND
        </h2>

        {/* Brand Name */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={{ fontWeight: "500" }}>Brand Name</label>
          </div>
          <div style={{ width: "58%" }}>
            <input
              type="text"
              value={name}
              placeholder="Enter Brand Name"
              onChange={(e) => setName(e.target.value)}
              style={{ border: "1px solid black", backgroundColor: "white" }}
            />
          </div>
        </div>

        {/* Image */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <label style={{ fontWeight: "500" }}>Brand Image</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "58%",
            }}
          >
            <input
              type="file"
              onChange={ImagePreview}
              style={{
                width: "100%",
                height: "45px",
                borderRadius: "10px",
                marginRight: "20px",
                border: "0.5px solid black",
                backgroundColor: "white",
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  width: "130px",
                  height: "130px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={{ fontWeight: "500" }}>Type</label>
          </div>
          <div style={{ width: "58%" }}>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              style={{
                border: "1px solid black",
                backgroundColor: "white",
                width: "100%",
              }}
            >
              <option value="">-- Select Type --</option>
              {brandTypes.map((typeItem) => (
                <option key={typeItem._id} value={typeItem._id}>
                  {typeItem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={{ fontWeight: "500" }}>Description</label>
          </div>
          <div style={{ width: "59%" }}>
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                borderRadius: "10px",
                marginLeft: "8px",
                padding: "5px",
              }}
            />
          </div>
        </div>

        {/* Is Featured */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={{ fontWeight: "500" }}>Is Featured</label>
          </div>
          <div style={{ width: "58%" }}>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            <span>{featured ? "Yes" : "No"}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: "center" }}>
          <Button
            style={{
              width: "80px",
              height: "40px",
              fontSize: "16px",
              marginTop: "10px",
              marginBottom: "20px",
              backgroundColor: "#00c853",
              color: "white",
              borderRadius: "15px",
              marginRight: "50px",
              cursor: "pointer",
            }}
            onClick={handleBrands}
          >
            SAVE
          </Button>
          <Button
            onClick={() => navigate(-1)}
            style={{
              width: "80px",
              height: "40px",
              fontSize: "16px",
              marginTop: "10px",
              marginBottom: "20px",
              backgroundColor: "#00c853",
              color: "white",
              borderRadius: "15px",
              cursor: "pointer",
            }}
          >
            BACK
          </Button>
        </div>
      </div>
    </MDBox>
  );
}

export default AddBrand;
