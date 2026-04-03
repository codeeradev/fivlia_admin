import React, { useEffect, useState } from "react";
import "./Addcategories.css";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";

const EditSubCat = () => {
  const [name, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [id,setId]=useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;


  const category = location.state;
  


  useEffect(() => {
    if (category) {
       
      setCategoryName(category.name || "");
      setDescription(category.description || "");
      setImagePreview(category.image || null); 
      setId(category._id)
    } else {
      console.warn("No category data provided in location.state");
      alert("No category data provided.");
      navigate(-1);
    }
  }, [category, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file); 

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result); 
      reader.readAsDataURL(file);
    } else {
      setImagePreview(category.image || null); 
    }
  };

  const handleSubmit = async () => {
  if (!name) {
    alert("Please enter a category name.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  if (image) {
    formData.append("image", image);
  }

  try {
    const response = await fetch(`https://node-m8jb.onrender.com/edit-category/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (response.status === 200) {
      alert("Category updated successfully!");
      navigate(-1);
    } else {
      const errorData = await response.json();
      alert(
        errorData.message || `Failed to update category (Status: ${response.status})`
      );
    }
  } catch (err) {
    console.error("Error updating category:", err);
    alert("Error updating category: " + err.message);
  }
};

  return (
    <MDBox
      ml={miniSidenav ? "80px" : "250px"}
      p={2}
      sx={{ marginTop: "20px" }}
    >
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
          EDIT CATEGORY
        </h2>

        {/* Category Name */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={{ fontWeight: "500" }}>Sub Category Name</label>
          </div>
          <div style={{ width: "59.5%" }}>
            <input
              type="text"
              placeholder="Enter Category Name"
              value={name}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{ border: "1px solid black", backgroundColor: "white" }}
            />
          </div>
        </div>

        {/* Category Image */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={{ fontWeight: "500" }}>Category Image</label>
          </div>
          <div style={{ width: "36%" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ border: "1px solid black", backgroundColor: "white" }}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  marginTop: "-30px",
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#666",
                }}
              >
                No Image
              </div>
            )}
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
          <div style={{ width: "59%", marginLeft: "45px" }}>
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                borderRadius: "10px",
                padding: "5px",
              }}
            />
          </div>
        </div>
        

        {/* Submit Button */}
        <div style={{ textAlign: "center" }}>
          <Button
            onClick={handleSubmit}
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
          >
            EDIT
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
};

export default EditSubCat;