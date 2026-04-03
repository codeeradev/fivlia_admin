import React, { useEffect, useState } from "react";
import "./Addcategories.css";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { toast } from "react-toastify";

import { showAlert } from "components/commonFunction/alertsLoader";

// common API helpers (from your provided common file)
import { getAllFilters, getAllAttributes, getAllBrands } from "components/commonApi/commonApi";
// put and ENDPOINTS for editing since product.api doesn't export editMainCategory
import { put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

const EditCategory = () => {
  const [name, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [id, setId] = useState("");
  const [allFilters, setAllFilters] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterValues, setFilterValues] = useState([]);
  const [selectedFilterArray, setSelectedFilterArray] = useState([]);
  const [filterPopup, setFilterPopup] = useState(false);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [addFilterValue, setAddFilterValue] = useState("");
  const [allBrands, setAllBrands] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const category = location.state;

  useEffect(() => {
    if (category) {
      setId(category._id);
      setCategoryName(category.name);
      setDescription(category.description || "");
      setImagePreview(`${process.env.REACT_APP_IMAGE_LINK}${category.image}` || null);
    }
  }, [category]);

  useEffect(() => {
    const getFilters = async () => {
      try {
        const result = await getAllFilters();
        const res = result.data;
        setAllFilters(res);
      } catch (err) {
        console.log(err);
        showAlert("error", "Error fetching filters");
      }
    };
    getFilters();

    const getAttributes = async () => {
      try {
        const result = await getAllAttributes();
        const res = result.data;
        setAllAttributes(res);
      } catch (err) {
        console.log(err);
        showAlert("error", "Error fetching attributes");
      }
    };
    getAttributes();
  }, []);

  useEffect(() => {
    const getBrands = async () => {
      try {
        const res = await getAllBrands(); // Adjust if your route is different
        if (res.status === 200) {
          const data = res.data;
          setAllBrands(data.allBrands);
          setAllFilters((prev) => [
            ...prev,
            {
              _id: "brand-filter",
              Filter_name: "Brand",
              Filter: data.allBrands.map((b) => ({
                _id: b._id,
                name: b.brandName,
              })),
            },
          ]);
        }
      } catch (err) {
        console.log(err);
        toast.error("Error fetching brands");
      }
    };
    getBrands();
  }, []);

  useEffect(() => {
    if (!category || allFilters.length === 0) return;

    // Map attribute names to their _id values
    const initialAttributes = Array.isArray(category.attribute)
      ? category.attribute
          .map((attrName) => {
            const attr = allAttributes.find((a) => a.Attribute_name === attrName);
            return attr ? attr._id : null;
          })
          .filter(Boolean)
      : [];
    setSelectedAttributes(initialAttributes);

    // Initialize selected filter values from category
    const initialSelectedFilters = Array.isArray(category.filter)
      ? category.filter.reduce((acc, f) => {
          const matchedFilter = allFilters.find(
            (af) => af._id === f._id || af.Filter_name === f.Filter_name
          );
          if (matchedFilter) {
            acc.push(...(f.selected || []).map((val) => val._id.toString()));
          }
          return acc;
        }, [])
      : [];

    setSelectedFilterArray(initialSelectedFilters);
  }, [category, allFilters, allAttributes]);

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

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);

    const selectedFilterObj = allFilters.find((f) => f._id === filterId);

    setFilterValues(selectedFilterObj?.Filter || []);
  };

  const handleFilterValueToggle = (valueId) => {
    setSelectedFilterArray((prev) =>
      prev.includes(valueId) ? prev.filter((id) => id !== valueId) : [...prev, valueId]
    );
  };

  const handleFilter = async () => {
    try {
      const result = await put(ENDPOINTS.ADD_FILTER, { Filter_name: filterName });
      showAlert("success", "Filter Added Successfully");
      setFilterPopup(false);
      setFilterName("");
      const res = result.data;
      setAllFilters((prev) => [...prev, res]);
    } catch (err) {
      console.log(err);
      showAlert("error", "Error adding filter");
    }
  };

  const handleFilterType = async () => {
    if (!selectedFilter || !addFilterValue.trim()) {
      showAlert("error", "Please select a filter and enter a value");
      return;
    }

    try {
const result = await put(ENDPOINTS?.ADD_FILTER, {
        _id: selectedFilter,
        Filter: [{ name: addFilterValue }],
      });
      showAlert("success", "Filter Value Added Successfully");
        setShowFilterDropdown(false);
        setAddFilterValue("");
        const updatedFilter = await result.data;
        setAllFilters((prev) =>
          prev.map((f) => (f._id === selectedFilter ? { ...f, Filter: updatedFilter.Filter } : f))
        );
        setFilterValues(updatedFilter.Filter);
    } catch (err) {
      console.log(err);
      showAlert("error", "Error adding filter value");
    }
  };

  const handleRemoveFilterValue = (valueId) => {
    setSelectedFilterArray((prev) => prev.filter((v) => v !== valueId));
  };

  const handleAttributeSelect = (e) => {
    const selectedAttrId = e.target.value;
    if (selectedAttrId && !selectedAttributes.includes(selectedAttrId)) {
      setSelectedAttributes((prev) => [...prev, selectedAttrId]);
    }
  };

  const handleRemoveAttribute = (attrId) => {
    setSelectedAttributes((prev) => prev.filter((a) => a !== attrId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showAlert("error", "Please enter a valid name.");
      return;
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", name);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    const filterData = allFilters
      .map((f) => {
        const isBrand = f.Filter_name === "Brand";

        const matchedIds = isBrand
          ? selectedFilterArray.filter((valId) => allBrands.some((b) => b._id === valId))
          : selectedFilterArray.filter((valId) => f.Filter.some((val) => val._id === valId));

        if (matchedIds.length === 0) return null;

        return {
          _id: f._id,
          selected: matchedIds,
        };
      })
      .filter(Boolean);

    formData.append("filter", JSON.stringify(filterData));
    formData.append("attribute", JSON.stringify(selectedAttributes));

    try {
      showAlert("loading", "Updating category...");
      const res = await put(ENDPOINTS.EDIT_CATEGORY, formData);
      const data = res?.data ?? res;

      // success detection: if your API wraps responses differently adapt this check
      if (res && (res.status === 200 || data?.success || data?.message)) {
        showAlert("success", "Category updated successfully!");
        navigate(-1);
      } else {
        const errMsg = data?.message || `Failed to update category`;
        showAlert("error", errMsg);
      }

    } catch (err) {
      console.error("Error updating category:", err);
      showAlert("error", "Error updating category");
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "20px" }}>
      <div
        style={{
          width: "85%",
          margin: "0 auto",
          padding: "10px",
          border: "1px solid gray",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "green", marginBottom: "30px" }}>EDIT CATEGORY</h2>

        {/* Category Name */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
          <div>
            <label style={{ fontWeight: "500" }}>Category Name</label>
          </div>
          <div style={{ width: "59.5%" }}>
            <input
              type="text"
              placeholder="Enter Category Name"
              value={name}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{
                border: "1px solid black",
                backgroundColor: "white",
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
              }}
            />
          </div>
        </div>

        {/* Image Upload */}
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
          <div>
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
                  backgroundColor: "#ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
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
                border: "1px solid black",
              }}
            />
          </div>
        </div>

        {/* Filter System */}
        <div className="filter-type" id="filter-type" style={{ margin: "0 38px" }}>
          <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
            Filters & Types
          </span>
          <div
            className="row-section"
            style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}
          >
            <div className="input-container" style={{ width: "45%" }}>
              <label style={{ fontWeight: "500" }}>
                Select Filter (Type) <span style={{ marginLeft: "5px", marginTop: "10px" }}>*</span>
              </label>
              <select
                className="input-field"
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid black",
                  backgroundColor: "white",
                }}
              >
                <option value="">--Select Filter--</option>
                {allFilters.map((filter) => (
                  <option key={filter._id} value={filter._id}>
                    {filter.Filter_name}
                  </option>
                ))}
              </select>
              <h3
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "green",
                  marginTop: "10px",
                  marginLeft: "5px",
                }}
                onClick={() => setFilterPopup(true)}
              >
                + ADD FILTER
              </h3>
              {filterPopup && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: 20,
                      borderRadius: 5,
                      minWidth: 300,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter Filter Name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        border: "1px solid black",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <Button
                        onClick={handleFilter}
                        style={{ backgroundColor: "#00c853", color: "white" }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setFilterPopup(false)}
                        style={{ backgroundColor: "#ccc", color: "black" }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="input-container" style={{ width: "45%" }}>
              <label style={{ fontWeight: "500" }}>
                Select Filter Value <span style={{ marginLeft: "5px", marginTop: "10px" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <button
                  className="input-field"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor: "white",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => setFilterDropdown(!filterDropdown)}
                >
                  {selectedFilterArray.length > 0
                    ? `${selectedFilterArray.length} value(s) selected`
                    : "--Select Filter Value--"}
                </button>
                {filterDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxHeight: "150px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {filterValues.map((value) => (
                      <div
                        key={value._id}
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #eee",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilterArray.includes(value._id)}
                          onChange={() => handleFilterValueToggle(value._id)}
                          style={{ marginRight: "8px" }}
                        />
                        <span>{value.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <h3
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "green",
                  marginTop: "10px",
                  marginLeft: "5px",
                }}
                onClick={() => setShowFilterDropdown(true)}
              >
                + ADD FILTER VALUE
              </h3>
              {showFilterDropdown && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: 20,
                      borderRadius: 5,
                      minWidth: 300,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter filter value"
                      value={addFilterValue}
                      onChange={(e) => setAddFilterValue(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        border: "1px solid black",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <Button
                        onClick={handleFilterType}
                        style={{ backgroundColor: "#00c853", color: "white" }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setShowFilterDropdown(false)}
                        style={{ backgroundColor: "#ccc", color: "black" }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "10px",
              minHeight: "30px",
              marginLeft: "20px",
              marginRight: "20px",
              marginBottom: "20px",
              border: "1px solid black",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            {selectedFilterArray.map((valueId, index) => {
              const value = allFilters.flatMap((f) => f.Filter).find((v) => v._id === valueId);

              return value ? (
                <div
                  key={index}
                  style={{
                    backgroundColor: "white",
                    padding: "6px 10px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    margin: "5px",
                  }}
                >
                  <span>{value?.name}</span>
                  <span
                    style={{
                      marginLeft: "5px",
                      cursor: "pointer",
                      color: "red",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleRemoveFilterValue(valueId)}
                  >
                    ×
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Attribute Dropdown */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
          <div>
            <label style={{ fontWeight: "500" }}>Select Attribute</label>
          </div>
          <div style={{ width: "59.5%" }}>
            <select
              value=""
              onChange={handleAttributeSelect}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid black",
                backgroundColor: "white",
              }}
            >
              <option value="">-- Select Attribute --</option>
              {allAttributes.map((attr) => (
                <option key={attr._id} value={attr._id}>
                  {attr.Attribute_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Attributes */}
        {selectedAttributes.length > 0 && (
          <div
            style={{
              marginTop: "30px",
              marginLeft: "60px",
              marginRight: "60px",
              borderRadius: "10px",
            }}
          >
            <h4 style={{ fontWeight: "500" }}>Selected Attributes</h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                border: "1px solid black",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              {selectedAttributes.map((attrId) => {
                const attr = allAttributes.find((a) => a._id === attrId);
                return (
                  <div
                    key={attrId}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "white",
                      borderRadius: "10px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span>{attr?.Attribute_name || "Unknown Attribute"}</span>
                    <button
                      onClick={() => handleRemoveAttribute(attrId)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit and Back Buttons */}
        <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px" }}>
          <Button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#00c853",
              color: "white",
              marginRight: "20px",
              borderRadius: "15px",
              width: "80px",
              height: "40px",
            }}
          >
            EDIT
          </Button>
          <Button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: "#00c853",
              color: "white",
              borderRadius: "15px",
              width: "80px",
              height: "40px",
            }}
          >
            BACK
          </Button>
        </div>
      </div>
    </MDBox>
  );
};

export default EditCategory;
