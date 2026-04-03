import React, { useEffect, useState } from "react";
import "./Addcategories.css";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { showAlert } from "components/commonFunction/alertsLoader";
import { get, post } from "../../api/apiClient";
import { ENDPOINTS } from "../../api/endPoints";

const AddCategories = () => {
  const [name, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [type, setType] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [attribute, setAttribute] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributeArray, setAttributeArray] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterData, setFilterData] = useState([]);
  const navigate = useNavigate();

  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  // Filter-related states
  const [filterTypes, setFilterTypes] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterPopup, setFilterPopup] = useState(false);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [addFilterValue, setAddFilterValue] = useState("");
  const [filterValues, setFilterValues] = useState([]);
  const [allFilters, setAllFilters] = useState([]); // [{ _id: filterId, selected: [valueId1, valueId2] }]

  // Fetch filters from API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await get(ENDPOINTS.GET_FILTERS);
        const data = res.data;
        setFilterTypes(data);
      } catch (err) {
        console.error("Error fetching Filters:", err);
      }
    };
    fetchFilters();
  }, []);

  const handleFilterChange = (e) => {
    const filterId = e.target.value;
    setSelectedFilter(filterId);

    const selectedFilterObj = filterTypes.find((f) => f._id === filterId);

    if (selectedFilterObj?.Filter_name === "Brand") {
      setFilterValues(brands.map((b) => ({ _id: b._id, name: b.brandName })));
    } else {
      setFilterValues(selectedFilterObj?.Filter || []);
    }
  };

  const handleFilterValueToggle = (filterId, valueId) => {
    setAllFilters((prev) => {
      const existingFilter = prev.find((f) => f._id === filterId);

      if (existingFilter) {
        const alreadySelected = existingFilter.selected.includes(valueId);

        const updatedSelected = alreadySelected
          ? existingFilter.selected.filter((id) => id !== valueId)
          : [...existingFilter.selected, valueId];

        return prev.map((f) => (f._id === filterId ? { ...f, selected: updatedSelected } : f));
      } else {
        const selectedFilterObj = filterTypes.find((f) => f._id === filterId);
        return [
          ...prev,
          {
            _id: filterId,
            Filter_name: selectedFilterObj?.Filter_name || "Unnamed",
            selected: [valueId],
          },
        ];
      }
    });
  };

  // Add new filter
  const handleFilter = async () => {
    try {
      const result = await post(ENDPOINTS.ADD_FILTER, {
        Filter_name: filterName,
      });

      if (result.status === 200) {
        showAlert("success", "Filter Added Successfully");
        setFilterPopup(false);
        setFilterName("");
        // Refresh filter types
        const res = await get(ENDPOINTS.GET_FILTERS);
        const data = res.data;
        setFilterTypes(data);
      } else {
        showAlert("error", "Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Add new filter value
  const handleFilterType = async () => {
    if (!selectedFilter || !addFilterValue.trim()) {
      showAlert("warning", "Please select a filter and enter a value");
      return;
    }

    try {
      const result = await post(ENDPOINTS.ADD_FILTER, {
        _id: selectedFilter,
        Filter: [{ name: addFilterValue }],
      });

      if (result.status === 200) {
        showAlert("success", "Filter Value Added Successfully");
        setShowFilterDropdown(false);
        setAddFilterValue("");
        // Refresh filter values
        const res = await get(ENDPOINTS.GET_FILTERS);
        const data = res.data;
        setFilterTypes(data);
        const selectedFilterObj = data.find((f) => f._id === selectedFilter);
        setFilterValues(selectedFilterObj?.Filter || []);
      } else {
        showAlert("error", "Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Remove filter
  const removeFilter = (filterId) => {
    setAllFilters((prev) => prev.filter((f) => f._id !== filterId));
  };

  // Fetch main categories and attributes
  useEffect(() => {
    const getMainCategory = async () => {
      try {
        const data = await get(ENDPOINTS.GET_MAIN_CATEGORY);
        const result = data.data;

        setMainCategories(result.result);
        const allSubCategories = result.result.flatMap((cat) => cat.subcat || []);
        setSubCategories(allSubCategories);
      } catch (err) {
        console.log(err);
      }
    };
    getMainCategory();

    const fetchAttribute = async () => {
      try {
        const res = await get(ENDPOINTS.GET_ATTRIBUTES);
        const data = res.data;
        setAttribute(data);
      } catch (err) {
        console.error("Error fetching attributes:", err);
      }
    };
    fetchAttribute();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await get(ENDPOINTS.GET_BRANDS);
        const data = res.data;
        setBrands(data.allBrands);
        setFilterTypes((prev) => [
          ...prev.filter((f) => f.Filter_name !== "Brand"),
          {
            _id: "brand-filter",
            Filter_name: "Brand",
            Filter: data.allBrands.map((b) => ({
              _id: b._id,
              name: b.brandName,
            })),
          },
        ]);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };
    fetchBrands();
  }, []);
  // Set attributes for Main Category
  useEffect(() => {
    if (type === "Main Category") {
      const allAttributeNames = attribute.map((item) => item._id); // Use _id instead of Attribute_name
      setAttributeArray(allAttributeNames);
    } else {
      setAttributeArray([]);
    }
  }, [type, attribute]);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !name ||
      !description ||
      !image ||
      !type ||
      (type === "Sub Category" && !mainCategoryId) ||
      (type === "Sub Sub-Category" && !subCategory)
    ) {
      showAlert("warning", "Please fill all fields!");
      return;
    }

    const formData = new FormData();
    showAlert("loading", "Adding Category... Please wait");
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);
    if (type === "Sub Category") {
      formData.append("mainCategoryId", mainCategoryId);
    }
    if (type === "Sub Sub-Category") {
      formData.append("subCategoryId", subCategory);
    }
    formData.append("attribute", JSON.stringify(attributeArray || []));
    formData.append("filter", JSON.stringify(allFilters || [])); // Send [{ _id, selected: [valueId1, valueId2] }]

    // Main Category Add
    if (type === "Main Category") {
      try {
        const response = await post(ENDPOINTS.ADD_MAIN_CATEGORY, formData)
        if (response.status === 201) {
          showAlert("success", "Category Added Successfully");
          navigate("/categories");
        } else {
          showAlert("error", "Something went wrong");
          console.error("Server response:", response.data);
        }
      } catch (err) {
        console.error("Error while submitting:", err);
      }
    }
    // Add Sub Category
    else if (type === "Sub Category") {
      try {
        const result = await post(ENDPOINTS.ADD_SUB_CATEGORY, formData);
        if (result.status === 200) {
          showAlert("success", "Sub Category Added Successfully");
          navigate("/categories");
        } else {
          showAlert("error", "Something went wrong");
        }
      } catch (err) {
        console.log(err);
      }
    }
    // Add Sub Sub-Category
    else {
      try {
        const result = await post(ENDPOINTS.ADD_SUBSUB_CATEGORY, formData);
        if (result.status === 201) {
          showAlert("success", "Category Added Successfully");
          navigate("/categories");
        } else {
          showAlert("error", "Something went wrong");
        }
      } catch (err) {
        console.log(err);
      }
    }

    // Reset form
    setCategoryName("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
    setType("");
    setMainCategoryId("");
    setSubCategory("");
    setAttributeArray([]);
    setAllFilters([]);
    setSelectedFilter("");
    setFilterValues([]);
  };

  // Handle attribute removal
  const handleTagRemove = (tagToRemove) => {
    setAttributeArray(attributeArray.filter((tag) => tag !== tagToRemove));
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
          ADD NEW CATEGORY
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
            <label style={{ fontWeight: "500" }}>Category Name</label>
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
              style={{ width: "100%", height: "100px", borderRadius: "10px", padding: "5px" }}
            />
          </div>
        </div>

        {/* Type */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "30px",
          }}
        >
          <div>
            <label style={{ fontWeight: "500" }}>Type</label>
          </div>
          <div style={{ width: "60%" }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                marginLeft: "30px",
                backgroundColor: "white",
                border: "1px solid black",
              }}
            >
              <option value="">-- Select Type Of Category --</option>
              <option value="Main Category">Main Category</option>
              <option value="Sub Category">Sub Category</option>
              <option value="Sub Sub-Category">Sub Sub-Category</option>
            </select>
          </div>
        </div>

        {/* Main Category (only for Sub Category) */}
        {type === "Sub Category" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "30px",
            }}
          >
            <div>
              <label style={{ fontWeight: "500" }}>Select Main Category</label>
            </div>
            <div style={{ width: "60%" }}>
              <select
                value={mainCategoryId}
                onChange={(e) => setMainCategoryId(e.target.value)}
                style={{
                  marginLeft: "-8px",
                  backgroundColor: "white",
                  border: "1px solid black",
                }}
              >
                <option value="">-- Select Main Category --</option>
                {mainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Sub Category (only for Sub Sub-Category) */}
        {type === "Sub Sub-Category" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "30px",
            }}
          >
            <div>
              <label style={{ fontWeight: "500" }}>Select Sub Category</label>
            </div>
            <div style={{ width: "60%", marginLeft: "10px" }}>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                style={{
                  marginLeft: "-8px",
                  backgroundColor: "white",
                  border: "1px solid black",
                }}
              >
                <option value="">-- Select Sub Category --</option>
                {subCategories.map((subcat) => (
                  <option key={subcat._id} value={subcat._id}>
                    {subcat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Filters & Types */}
        {type === "Main Category" && (
          <div className="" id="filter-type">
            <span
              style={{
                marginLeft: "20px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Filters & Types
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select Filter (Type)
                  <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select
                  className="input-field"
                  value={selectedFilter}
                  onChange={handleFilterChange}
                >
                  <option value="">--Select Filter--</option>
                  {filterTypes.map((filter) => (
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
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px",
                        }}
                      >
                        <Button onClick={handleFilter}>Save</Button>
                        <Button onClick={() => setFilterPopup(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {allFilters.map((filter) => {
                    const filterName =
                      filterTypes.find((f) => f._id === filter._id)?.Filter_name || "Unnamed";
                    return (
                      <div
                        key={filter._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#e0e0e0",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "14px",
                        }}
                      >
                        <span>{filterName}</span>
                        <button
                          onClick={() => removeFilter(filter._id)}
                          style={{
                            marginLeft: "8px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "red",
                            fontWeight: "bold",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="input-container">
                <label>
                  Select Filter Value
                  <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
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
                    {allFilters.find((f) => f._id === selectedFilter)?.selected.length > 0
                      ? `${
                          allFilters.find((f) => f._id === selectedFilter).selected.length
                        } value(s) selected`
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
                            checked={
                              allFilters
                                .find((f) => f._id === selectedFilter)
                                ?.selected.includes(value._id) || false
                            }
                            onChange={() => handleFilterValueToggle(selectedFilter, value._id)}
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
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px",
                        }}
                      >
                        <Button onClick={handleFilterType}>Save</Button>
                        <Button onClick={() => setShowFilterDropdown(false)}>Cancel</Button>
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
                marginBottom: "20px",
              }}
            >
              {allFilters.map((filter) =>
                (filter.selected || []).map((valueId, index) => {
                  const filterObj = filterTypes.find((f) => f._id === filter._id);
                  const isBrandFilter = filterObj?.Filter_name === "Brand";

                  const value = isBrandFilter
                    ? brands.find((b) => b._id === valueId)
                    : (filterObj?.Filter || []).find((f) => f._id === valueId);

                  return value ? (
                    <div
                      key={`${filter._id}-${valueId}-${index}`}
                      style={
                        {
                          /* styling */
                        }
                      }
                    >
                      <span>
                        {filterObj?.Filter_name || "Unnamed"}: {value?.name || value?.brandName}
                      </span>
                      <span
                        style={{ cursor: "pointer", marginLeft: "5px" }}
                        onClick={() => handleFilterValueToggle(filter._id, valueId)}
                      >
                        ×
                      </span>
                    </div>
                  ) : null;
                })
              )}
            </div>
          </div>
        )}

        {/* Selected Attributes */}
        {type === "Main Category" && attributeArray.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "30px",
            }}
          >
            <div>
              <label style={{ fontWeight: "500" }}>Selected Attributes</label>
            </div>
            <div
              style={{
                backgroundColor: "",
                width: "60%",
                border: "1px solid black",
                minHeight: "45px",
                borderRadius: "10px",
              }}
            >
              {attributeArray.map((zone, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "white",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    margin: "5px",
                    boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
                  }}
                  title={zone}
                >
                  {attribute.find((attr) => attr._id === zone)?.Attribute_name || zone}
                  <button
                    onClick={() => handleTagRemove(zone)}
                    style={{
                      marginLeft: "5px",
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
          </div>
        )}

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
};

export default AddCategories;
