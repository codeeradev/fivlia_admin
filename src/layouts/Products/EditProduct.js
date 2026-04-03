import React, { useEffect, useRef, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom";
import "./Product.css";
import ColorNamer from "color-namer";
import { Button, Switch } from "@mui/material";

import { showAlert } from "components/commonFunction/alertsLoader";

import { get, post, patch } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

function EditProduct() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const [variantPrices, setVariantPrices] = useState({});
  const [colorHexCodes, setColorHexCodes] = useState({});
  const [colorError, setColorError] = useState("");
  const [activeVariant, setActiveVariant] = useState("");
  const [filterValues, setFilterValues] = useState([]);
  const [selectedFilterValue, setSelectedFilterValue] = useState("");
  const [variantImages, setVariantImages] = useState({}); // Added for variant image handling
  const [returnProduct, setReturnProduct] = useState({ title: "", image: null });
  const returnImageInputRef = useRef(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const thumbnailInputRef = useRef(null); // Added for thumbnail handling

  const sectionIds = ["basicinfo", "imagesection", "category-section", "citysection", "taxsection"];

  // State declarations
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subsubCategories, setSubsubCategories] = useState([]);
  const [citydata, setCityData] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ribbon, setRibbon] = useState("");
  const [mrp, setMrp] = useState("");
  const [sellingprice, setSellingPrice] = useState("");
  const [status, setStatus] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const [showUnitPopup, setShowUnitPopup] = useState(false);
  const [showbrandPopup, setShowbrandPopup] = useState(false);
  const [addAttribute, setAddattribute] = useState("");
  const [addVarient, setAddVarient] = useState("");
  const [addUnit, setAddUnit] = useState("");
  const [addBrand, setBrand] = useState("");
  const [unitsData, setUnitsData] = useState([]);
  const [unitname, setUnitName] = useState("");
  const [des, setDes] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [brandImageError, setBrandImageError] = useState("");
  const brandImageInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [subSubCategory, setSubSubCategory] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [cityZones, setCityZones] = useState({});
  const [attribute, setAttribute] = useState([]);
  const [filteredAttributes, setFilteredAttributes] = useState([]);
  const [attributeValue, setAttributeValue] = useState([]);
  const [taxdata, setTaxData] = useState([]);
  const [cgst, setCgst] = useState("");
  const [id, setId] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [thumbnailError, setThumbnailError] = useState("");
  const [zones, setZones] = useState([]);
  const [attributedata, setAttributeData] = useState("");
  const [colors, setColors] = useState([]);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [filterpopup, setShowFilterPopup] = useState(false);
  const [addfilter, setAddFilter] = useState("");
  const [selectedfilter, setSelectedFilter] = useState("");
  const [addfiltervaluepopup, setAddFilterValuePopup] = useState(false);
  const [filterTypeName, setFilterTypeName] = useState("");
  const [filters, setFilters] = useState([]);
  const [selectedValuesByFilter, setSelectedValuesByFilter] = useState({});
  const [newFilterValue, setNewFilterValue] = useState("");
  const [filterid, setFilterId] = useState("");
  const [singlefilterdata, setSingleFilterData] = useState([]);
  const [selecetdcategory, setSelectedcategory] = useState("");
  const [isFood, setIsFood] = useState(false);
  const [isVeg, setIsVeg] = useState(false);
  const [isNonVeg, setIsNonVeg] = useState(false);
  const [originalFilterData, setOriginalFilterData] = useState([]);

  const maxSize = 500 * 1024; // 500KB

  // Handle variant image change
  const handleVariantImageChange = (variantName, e) => {
    const file = e.target.files[0];
    if (file && file.size <= maxSize) {
      setVariantImages((prev) => ({
        ...prev,
        [variantName]: { file, preview: URL.createObjectURL(file) },
      }));
    } else {
      setError("Variant image must be less than 500KB.");
    }
  };

  // Handle thumbnail image change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= maxSize) {
      setThumbnailImage(file);
      setPreview(URL.createObjectURL(file));
      setThumbnailError("");
    } else {
      setThumbnailError("Thumbnail image must be less than 500KB.");
    }
  };

  // Handle thumbnail removal
  const handleRemoveThumbnail = () => {
    setThumbnailImage(null);
    setPreview(null);
    setThumbnailError("");
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleFilterValueChange = (e) => {
    const selectedId = e.target.value;
    setSelectedFilterValue(selectedId);

    const selectedOption = filterValues.find((val) => val._id === selectedId);
    if (!selectedOption) return;

    setSelectedValuesByFilter((prev) => {
      const existingValues = prev[filterTypeName] || [];
      const alreadyExists = existingValues.some((val) => val._id === selectedOption._id);
      if (alreadyExists) return prev;

      return {
        ...prev,
        [filterTypeName]: [...existingValues, selectedOption],
      };
    });
  };

  const handlePriceChange = (variantName, field, value) => {
    setVariantPrices((prev) => ({
      ...prev,
      [variantName]: {
        ...prev[variantName],
        [field]: value,
      },
    }));
  };

  const handleHexCodeChange = (variantName, hexCode) => {
    setColorHexCodes((prev) => ({
      ...prev,
      [variantName]: hexCode,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 4;
    const currentCount = selectedImages.length;
    const remainingSlots = maxImages - currentCount;

    const newImages = [];
    let rejected = false;
    let tooMany = false;

    files.forEach((file, index) => {
      if (index < remainingSlots) {
        if (file.size <= maxSize) {
          const newfiles = URL.createObjectURL(file);
          newImages.push({
            file,
            newfiles,
          });
          if (index === 0 && currentCount === 0 && !thumbnailImage) {
            setThumbnailImage(file);
            setPreview(URL.createObjectURL(file));
            setThumbnailError("");
          }
        } else {
          rejected = true;
        }
      } else {
        tooMany = true;
      }
    });

    if (tooMany) {
      setError("Maximum 4 photos");
    } else if (rejected) {
      setError("Image size greater than 500KB");
    } else {
      setError("");
    }

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const handleImageRemove = (indexToRemove) => {
    setSelectedImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
    // If removing the first image (thumbnail), clear thumbnail
    if (indexToRemove === 0 && selectedImages.length > 0) {
      setThumbnailImage(null);
      setPreview(null);
      setThumbnailError("");
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
      // Set next image as thumbnail if available
      if (selectedImages.length > 1) {
        const nextImage = selectedImages[1];
        setThumbnailImage(nextImage.file);
        setPreview(nextImage.newfiles);
      }
    }
  };

  const handleAttributeValueChange = (e) => {
    const variantName = e.target.value;
    const selectedAttr = attribute.find((attr) => attr._id === attributedata);

    if (variantName && selectedAttr) {
      const isDuplicate = attributeValue.some(
        (item) =>
          item.variantName === variantName && item.attributeName === selectedAttr.Attribute_name
      );

      if (!isDuplicate) {
        const newAttributeValue = [
          ...attributeValue,
          {
            attributeName: selectedAttr.Attribute_name,
            variantName,
            unit: unitname,
          },
        ];
        setAttributeValue(newAttributeValue);

        if (selectedAttr.Attribute_name.toLowerCase() === "color") {
          setActiveVariant(variantName);
        }
      }
    }
  };

  const handleDeleteVariant = async (id, variantName) => {
    if (!window.confirm(`Are you sure you want to delete the variant "${variantName}"?`)) return;
    try {
      const result = await fetch(`https://node-m8jb.onrender.com/deleteVarient/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const responseBody = await result.json();
      if (result.status === 200) {
        alert("Variant Deleted Successfully");
        const res = await get(ENDPOINTS.GET_ATTRIBUTES);
        setAttribute(res.data);
        setAttributeValue((prev) => prev.filter((item) => item.variantName !== variantName));
      } else {
        alert(responseBody.message || `Failed to delete variant (Status: ${result.status})`);
      }
    } catch (err) {
      console.error("Error deleting variant:", err);
      alert("Error deleting variant: " + err.message);
    }
  };

  const handleRemoveCategory = (categoryId) => {
    const updatedCategories = category.filter((id) => id !== categoryId);
    setCategory(updatedCategories);
    if (updatedCategories.length > 0) {
      const selectedCats = categories.filter((cat) => updatedCategories.includes(cat._id));
      const allSubCats = selectedCats
        .flatMap((cat) => cat.subcat || [])
        .filter((sub, index, self) => index === self.findIndex((s) => s._id === sub._id));
      setSubCategories(allSubCats);
      const allAttributes = selectedCats
        .flatMap((cat) => cat.attribute || [])
        .filter((attr, index, self) => index === self.findIndex((a) => a === attr));
      setFilteredAttributes(allAttributes);
    } else {
      setSubCategories([]);
      setSubsubCategories([]);
      setFilteredAttributes([]);
    }
    setSubCategory("");
    setSubSubCategory("");
  };

  const handleSubCategoryChange = (e) => {
    const selectedId = e.target.value;
    setSubCategory(selectedId);
    setSubSubCategory("");
    setAttributeValue([]);
    setAttributeData("");

    const selectedSub = subCategories.find((sub) => sub._id === selectedId);
    if (selectedSub) {
      setSubsubCategories(selectedSub.subsubcat || []);
      const selectedCats = categories.filter((cat) => category.includes(cat._id));
      const combinedAttributes = selectedCats.flatMap((cat) => cat.attribute || []);
      setFilteredAttributes(
        selectedSub.attribute?.length > 0 ? selectedSub.attribute : combinedAttributes
      );
    } else {
      setSubsubCategories([]);
      const selectedCats = categories.filter((cat) => category.includes(cat._id));
      const combinedAttributes = selectedCats.flatMap((cat) => cat.attribute || []);
      setFilteredAttributes(combinedAttributes);
    }
  };

  const handleSubSubCategoryChange = (e) => {
    const selectedId = e.target.value;
    setSubSubCategory(selectedId);
    setAttributeValue([]);
    setAttributeData("");

    const selectedSubSub = subsubCategories.find((subsub) => subsub._id === selectedId);
    if (selectedSubSub) {
      const selectedSub = subCategories.find((sub) => sub._id === subCategory);
      const selectedCats = categories.filter((cat) => category.includes(cat._id));
      const combinedAttributes = selectedCats.flatMap((cat) => cat.attribute || []);
      setFilteredAttributes(
        selectedSubSub.attribute?.length > 0
          ? selectedSubSub.attribute
          : selectedSub?.attribute?.length > 0
          ? selectedSub.attribute
          : combinedAttributes
      );
    } else {
      const selectedSub = subCategories.find((sub) => sub._id === subCategory);
      const selectedCats = categories.filter((cat) => category.includes(cat._id));
      const combinedAttributes = selectedCats.flatMap((cat) => cat.attribute || []);
      setFilteredAttributes(
        selectedSub?.attribute?.length > 0 ? selectedSub.attribute : combinedAttributes
      );
    }
  };

  const handleAttribute = async () => {
    if (!addAttribute.trim()) {
      alert("Please enter an attribute name.");
      return;
    }
    if (!category[0]) {
      alert("Please select at least one category.");
      return;
    }
    try {
      const result = await patch(`${ENDPOINTS.UPDATE_ATTRIBUTE}/${category[0]}`, {
        attribute: addAttribute,
      });
      if (result.status === 200) {
        alert("Attribute Added Successfully");
        setShowPopup(false);
        setAddattribute("");
        const res = await get(ENDPOINTS.GET_ATTRIBUTES);
        setAttribute(res.data);
      } else {
        alert(result.data?.message || `Failed to add attribute (Status: ${result.status})`);
      }
    } catch (err) {
      console.error("Error adding attribute:", err);
      alert("Error adding attribute: " + err.message);
    }
  };

  const handleVarient = async () => {
    if (!attributedata) {
      alert("Please select an attribute first.");
      return;
    }
    if (!addVarient) {
      alert("Please enter a variant name.");
      return;
    }
    try {
      const result = await fetch(`https://node-m8jb.onrender.com/addvarient/${attributedata}`, {
        method: "PUT",
        body: JSON.stringify({ name: addVarient }),
        headers: { "Content-Type": "application/json" },
      });
      const responseBody = await result.json();
      if (result.status === 200) {
        alert("Variant Added Successfully");
        setShowVariantPopup(false);
        setAddVarient("");
        const res = await get(ENDPOINTS.GET_ATTRIBUTES);
        setAttribute(res.data);
      } else {
        alert(responseBody.message || `Failed to add variant (Status: ${result.status})`);
      }
    } catch (err) {
      console.error("Error adding variant:", err);
      alert("Error adding variant: " + err.message);
    }
  };

  const handleUnitData = async () => {
    if (!addUnit) {
      return alert("Please Input Unit Name");
    }
    try {
      const result = await post(ENDPOINTS.ADD_UNIT, { unitname: addUnit });
      if (result.status === 200) {
        alert("Unit Added Successfully");
        setShowUnitPopup(false);
        const res = await get(ENDPOINTS.GET_UNIT);
        setUnitsData(res.data.Result);
      } else {
        alert("Something Wrong");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBrandImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        setBrandImageError("Please upload a valid image (JPEG, PNG, JPG)");
        setBrandImage(null);
        return;
      }
      if (file.size > maxSize) {
        setBrandImageError("Image size must be less than 500KB");
        setBrandImage(null);
        return;
      }
      setBrandImageError("");
      setBrandImage(file);
    }
  };

  const handleBrand = async () => {
    if (!addBrand.trim()) {
      alert("Please enter a brand name.");
      return;
    }
    const formData = new FormData();
    formData.append("brandName", addBrand);
    formData.append("description", des);
    if (brandImage) formData.append("image", brandImage);
    try {
      const result = await post(ENDPOINTS.ADD_BRAND, formData);
      if (result.status === 200) {
        alert("Brand Created Successfully");
        setShowbrandPopup(false);
        setBrand("");
        setDes("");
        setBrandImage(null);
        if (brandImageInputRef.current) brandImageInputRef.current.value = "";
        const res = await get(ENDPOINTS.GET_BRANDS);
        setBrands(res.data.allBrands);
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setCity(cityId);
    const selectedCity = citydata.find((item) => item._id === cityId);
    if (selectedCity) {
      const cityZonesList = selectedCity.zones || [];
      setZones(cityZonesList);
      const allZoneAddresses = [...new Set(cityZonesList.map((zone) => zone.address))];
      setZone(allZoneAddresses);

      if (!selectedCities.some((c) => c._id === cityId)) {
        setSelectedCities((prev) => [
          ...prev,
          {
            _id: selectedCity._id,
            city: selectedCity.city,
            zones: cityZonesList,
          },
        ]);
        setCityZones((prev) => ({
          ...prev,
          [cityId]: cityZonesList.map((zone) => zone.address),
        }));
      }
    } else {
      setZones([]);
      setZone([]);
    }
  };

  const handleRemoveCity = (cityId) => {
    setSelectedCities((prev) => prev.filter((city) => city._id !== cityId));
    setCityZones((prev) => {
      const updated = { ...prev };
      delete updated[cityId];
      return updated;
    });

    if (city === cityId) {
      setCity("");
      setZones([]);
      setZone([]);
    }
  };

  const handleReturnImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        setError("Please upload a valid image (JPEG, PNG, JPG) for return policy");
        setReturnProduct((prev) => ({ ...prev, image: null }));
        return;
      }
      if (file.size > maxSize) {
        setError("Return policy image must be less than 500KB");
        setReturnProduct((prev) => ({ ...prev, image: null }));
        return;
      }
      setError("");
      setReturnProduct((prev) => ({ ...prev, image: file }));
    }
  };

  const handleRemoveReturnImage = () => {
    setReturnProduct((prev) => ({ ...prev, image: null }));
    if (returnImageInputRef.current) {
      returnImageInputRef.current.value = "";
    }
  };
  const handleReturnPolicyChange = (policy) => {
    setReturnProduct((prev) => ({ ...prev, title: policy }));
  };

  const handleRemoveZoneFromCity = (cityId, zoneAddress) => {
    setCityZones((prev) => ({
      ...prev,
      [cityId]: prev[cityId].filter((z) => z !== zoneAddress),
    }));

    if (city === cityId) {
      setZone((prev) => prev.filter((z) => z !== zoneAddress));
    }
  };

  const getDisplayZoneAddress = (zoneAddress) => {
    const parts = zoneAddress.split(",");
    return parts.length <= 2 ? zoneAddress : parts.slice(0, 2).join(",").trim();
  };

  const addColor = () => {
    const hasColorVariant = attributeValue.some(
      (item) => item.attributeName.toLowerCase() === "color"
    );
    if (!hasColorVariant) {
      setColorError("Please select a color variant first.");
      return;
    }
    setColorError("");
    const name = ColorNamer(currentColor).ntc[0].name;
    if (!colors.some((c) => c.hex === currentColor)) {
      const newColors = [...colors, { hex: currentColor, name }];
      setColors(newColors);
      if (activeVariant) {
        setColorHexCodes((prev) => ({ ...prev, [activeVariant]: currentColor }));
      } else {
        const colorVariants = attributeValue.filter(
          (item) => item.attributeName.toLowerCase() === "color"
        );
        if (colorVariants.length > 0) {
          const latestColorVariant = colorVariants[colorVariants.length - 1];
          setColorHexCodes((prev) => ({ ...prev, [latestColorVariant.variantName]: currentColor }));
          setActiveVariant(latestColorVariant.variantName);
        }
      }
    }
  };

  const removeColor = (hexToRemove) => {
    setColors((prev) => prev.filter((c) => c.hex !== hexToRemove));
    setColorHexCodes((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (updated[key] === hexToRemove) updated[key] = "";
      });
      return updated;
    });
  };

  const handleHexCodeClick = (variantName) => {
    setActiveVariant(variantName);
  };

  const handleFeatureToggle = (event) => {
    setIsFeatured(event.target.checked);
  };

  const handleRemoveVariant = (variantIdToRemove, variantNameToRemove) => {
    setAttributeValue((prev) =>
      prev.filter(
        (item) => item._id !== variantIdToRemove || item.variantName !== variantNameToRemove
      )
    );
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await get(ENDPOINTS.GET_FILTERS);
        const data = res.data;
        setFilters(data);
      } catch (err) {
        console.error("Error fetching Filters:", err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const GetFilterData = async () => {
      try {
        const reset = await fetch(`https://node-m8jb.onrender.com/getfilter/${filterTypeName}`);
        if (reset.status === 200) {
          const data = await reset.json();
          setSingleFilterData(data.result?.Filter || []);
        }
      } catch (err) {
        console.log(err);
      }
    };
    GetFilterData();
  }, []);

  useEffect(() => {
    const getsingleCategory = async () => {
      if (!selecetdcategory) {
        setFilters([]);
        setFilterValues([]);
        setFilterTypeName("");
        setSelectedValuesByFilter({});
        return;
      }
      try {
        const result = await fetch(
          `https://node-m8jb.onrender.com/getcategorybyid/${selecetdcategory}`
        );
        if (result.status === 200) {
          const data = await result.json();
          const rawFilters = data.response.filter || [];

          const selectedByFilter = {};
          rawFilters.forEach((f) => {
            if (f.selected && f.selected.length > 0) {
              selectedByFilter[f._id] = f.selected.map((s) => ({
                _id: s._id,
                name: s.name,
              }));
            }
          });

          setSelectedValuesByFilter(selectedByFilter);

          if (filterTypeName) {
            const filterRes = await fetch(
              `https://node-m8jb.onrender.com/getfilter/${filterTypeName}`
            );
            if (filterRes.status === 200) {
              const filterData = await filterRes.json();
              setFilterValues(filterData.result?.Filter || []);
            } else {
              setFilterValues([]);
            }
          }
        } else {
          setSelectedValuesByFilter({});
          setFilterValues([]);
        }
      } catch (err) {
        console.error("Error fetching category filters:", err);
        setSelectedValuesByFilter({});
        setFilterValues([]);
      }
    };

    getsingleCategory();
  }, [selecetdcategory]);

  const getCategory = async () => {
    try {
      const res = await get(ENDPOINTS.GET_MAIN_CATEGORY);
      setCategories(res.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  const getActiveCity = async () => {
    try {
      const res = await get(ENDPOINTS.GET_ALL_ZONE);
      setCityData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await get(ENDPOINTS.GET_BRANDS);
      setBrands(res.data.allBrands || []);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
      setBrands([]);
    }
  };

  const getTax = async () => {
    try {
      const res = await get(ENDPOINTS.GET_TAX);
      setTaxData(res.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttribute = async () => {
    try {
      const res = await get(ENDPOINTS.GET_ATTRIBUTES);
      console.log(res);
      setAttribute(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getUnits = async () => {
    try {
      const res = await get(ENDPOINTS.GET_UNIT);
      setUnitsData(res.data.Result || []);
    } catch (err) {
      console.error(err);
    }
  };

  const setData = (data) => {
    if (!data) {
      alert("No product data provided.");
      navigate(-1);
      return;
    }

    setId(data._id || "");
    setName(data.productName || "");
    setDescription(data.description || "");
    setRibbon(data.ribbon || "");
    setMrp(data.mrp || "");
    setSellingPrice(data.sell_price || "");
    setStatus(data.online_visible || true);
    setIsFeatured(data.feature_product || false);
    setThumbnailImage(data.productThumbnailUrl || null);
    setPreview(data.productThumbnailUrl || null);

    setSelectedImages(data.productImageUrl?.map((url) => ({ file: null, newfiles: url })) || []);

    const categoryIds = data.category?.map((cat) => cat._id) || [];
    setCategory(categoryIds);
    setSelectedcategory(categoryIds[0] || "");

    const allAttributes = data.category
      ?.flatMap((cat) => cat.attribute || [])
      .filter((attr, index, self) => attr && self.indexOf(attr) === index);
    setFilteredAttributes(allAttributes || []);

    setSelectedBrand(data.brand_Name || null);

    const cityMap = new Map();
    data.location?.forEach((loc) => {
      const cityArray = Array.isArray(loc.city) ? loc.city : [loc.city].filter(Boolean);
      cityArray.forEach((cityItem) => {
        const cityId = cityItem?._id;
        const cityName = cityItem?.name;
        const zoneObj = Array.isArray(loc.zone) ? loc.zone : [loc.zone].filter(Boolean);

        if (cityId && cityName) {
          if (!cityMap.has(cityId)) {
            cityMap.set(cityId, {
              _id: cityId,
              city: cityName,
              zones: [],
            });
          }
          const cityEntry = cityMap.get(cityId);
          zoneObj.forEach((z) => {
            if (z?._id && z?.name) {
              cityEntry.zones.push({ _id: z._id, address: z.name });
            }
          });
        }
      });
    });

    const cities = Array.from(cityMap.values()).filter((c) => c.zones.length > 0);
    const zonesMap = {};
    cities.forEach((city) => {
      zonesMap[city._id] = city.zones.map((z) => z.address);
    });

    setSelectedCities(cities);
    setCityZones(zonesMap);

    const firstCity = cities[0];
    if (firstCity) {
      setCity(firstCity._id || "");
      setZone(zonesMap[firstCity._id] || []);
      const selectedCity = citydata.find((item) => item._id === firstCity._id);
      if (selectedCity) setZones(selectedCity.zones || []);
    }

    setCgst(data.tax || "");
    setUnitName(data.unit?.name || "");

    if (Array.isArray(data.variants) && data.variants.length > 0) {
      const newAttributeValue = data.variants.map((variant) => {
        const variantValue = variant.variantValue || ""; // safe fallback
        const [name = "", unit = ""] = variantValue.split(" ");

        return {
          attributeName: variant.attributeName || "",
          variantName: name,
          unit: unit,
        };
      });

      setAttributeValue(newAttributeValue);

      const firstatt = newAttributeValue[0];
      if (firstatt) {
        setAttributeData(firstatt._id);
      }

      const newVariantPrices = {};
      data.variants.forEach((variant) => {
        const variantValue = variant.variantValue || "";
        const [name = ""] = variantValue.split(" ");

        newVariantPrices[name] = {
          mrp: variant.mrp || "",
          sell_price: variant.sell_price || "",
        };
      });
      setVariantPrices(newVariantPrices);

      // Initialize variantImages with existing variant images
      const newVariantImages = {};
      data.variants.forEach((variant, index) => {
        if (variant.image) {
          newVariantImages[variant.variantValue.split(" ")[0]] = {
            file: null,
            preview: variant.image,
          };
        }
      });
      setVariantImages(newVariantImages);

      const colorVariants = data.variants.filter(
        (variant) => (variant.attributeName || "").toLowerCase() === "color" && variant.hexCode
      );
      if (colorVariants.length > 0) {
        const newColorHexCodes = {};
        const newColors = colorVariants.map((variant) => {
          const name = ColorNamer(variant.hexCode).ntc[0].name;
          newColorHexCodes[variant.variantValue.split(" ")[0]] = variant.hexCode;
          return { hex: variant.hexCode, name };
        });
        setColorHexCodes(newColorHexCodes);
        setColors(newColors);
      }
    }

    if (data.filter?.length > 0) {
      const groupedFilters = {};
      const selectedByFilter = {};

      const originalFilters = data.filter.map((item) => ({
        _id: item._id,
        Filter_name: item.Filter_name,
        selected: item.selected?.map((s) => ({ _id: s._id, name: s.name })) || [],
      }));
      setOriginalFilterData(originalFilters);

      data.filter.forEach((item) => {
        const filterId = item._id;
        const filterName = item.Filter_name;
        const selectedArray = item.selected || [];

        if (!filterId || !filterName) return;

        if (!groupedFilters[filterId]) {
          groupedFilters[filterId] = {
            _id: filterId,
            Filter_name: filterName,
            values: [],
          };
        }

        if (!selectedByFilter[filterId]) {
          selectedByFilter[filterId] = [];
        }

        selectedArray.forEach((selected) => {
          if (selected?._id && selected?.name) {
            const val = { _id: selected._id, name: selected.name };
            groupedFilters[filterId].values.push(val);
            selectedByFilter[filterId].push(val);
          }
        });
      });

      const filterArray = Object.values(groupedFilters);
      setFilters(filterArray);
      setSelectedValuesByFilter(selectedByFilter);

      if (filterArray.length > 0) {
        const firstFilter = filterArray[0];
        setFilterTypeName(firstFilter._id);
        setFilterValues(firstFilter.values || []);

        if ((firstFilter.values || []).length > 0) {
          setSelectedFilterValue(firstFilter.values[0]._id);
        } else {
          setSelectedFilterValue("");
        }
      }
    }
    setSubCategory(data.subCategory?.[0]?._id || "");
    setSubSubCategory(data.subSubCategory?.[0]?._id || "");
  };

  const fetchFullProduct = async (productId) => {
    try {
      showAlert("loading", "Loading product...");
      const res = await get(`${ENDPOINTS.GET_PRODUCTS}?id=${productId}`);
      const product = res.data?.Product;

      if (!product) {
        showAlert("error", "Product not found");
        navigate(-1);
        return;
      }
      setOriginalProduct(product);
      setData(product);
      showAlert("info","",1)
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load product");
      navigate(-1);
    }
  };

  useEffect(() => {
    getCategory();
    getActiveCity();
    fetchBrands();
    getTax();
    fetchAttribute();
    getUnits();
    fetchFullProduct(location.state.id);

    const handleScroll = () => {
      let current = "";
      for (let id of sectionIds) {
        const section = document.getElementById(id);
        if (section) {
          const { top } = section.getBoundingClientRect();
          if (top <= 100) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handelProduct = async () => {
    showAlert("loading", "Updating product...");
    
    const formData = new FormData();

    formData.append("productName", name);
    formData.append("description", description);
    formData.append("ribbon", ribbon || "");
    formData.append("feature_product", isFeatured);
    formData.append("unit", unitname);
    formData.append("tax", cgst);
    formData.append("online_visible", true);
    formData.append("status", status);

    if (isFood) {
      if (isVeg) {
        formData.append("isVeg", 1); // Send 1 if Veg is selected
      }
      if (isNonVeg) {
        formData.append("isVeg", 2); // Send 2 if Non-Veg is selected
      }
    }

    if (returnProduct.title) {
      formData.append("returnProduct", JSON.stringify({ title: returnProduct.title }));
    }

    if (returnProduct.image) {
      formData.append("file", returnProduct.image);
    }

    if (thumbnailImage) {
      formData.append("image", thumbnailImage);
    }

    selectedImages
      .filter((image) => image.file)
      .forEach((image) => formData.append("MultipleImage", image.file));

    const categoryData = category
      .map((catId) => {
        const cat = categories.find((c) => c._id === catId);
        return cat ? cat._id : null;
      })
      .filter(Boolean);
    formData.append("category", JSON.stringify(categoryData));

    if (subCategory) {
      const selectedSub = subCategories.find((sub) => sub._id === subCategory);
      if (selectedSub) {
        formData.append("subCategory", selectedSub._id);
      }
    }

    if (subSubCategory) {
      const selectedSubSub = subsubCategories.find((subsub) => subsub._id === subSubCategory);
      if (selectedSubSub) {
        formData.append("subSubCategory", selectedSubSub._id);
      }
    }

    const locations = [];
    selectedCities.forEach((city) => {
      const zones = cityZones[city._id] || [];
      if (zones.length > 0) {
        const locationEntry = {
          city: [{ _id: city._id, name: city.city }],
          zone: zones
            .map((zoneAddress) => {
              const zoneObj = city.zones.find((z) => z.address === zoneAddress);
              return zoneObj ? { _id: zoneObj._id, name: zoneObj.address } : null;
            })
            .filter((zone) => zone !== null),
        };
        if (locationEntry.zone.length > 0) {
          locations.push(locationEntry);
        }
      }
    });

    if (city && zone.length > 0 && !selectedCities.some((c) => c._id === city)) {
      const selectedCity = citydata.find((item) => item._id === city);
      if (selectedCity) {
        const locationEntry = {
          city: [{ _id: selectedCity._id, name: selectedCity.city }],
          zone: zone
            .map((zoneAddress) => {
              const zoneObj = selectedCity.zones.find((z) => z.address === zoneAddress);
              return zoneObj ? { _id: zoneObj._id, name: zoneObj.address } : null;
            })
            .filter((zone) => zone !== null),
        };
        if (locationEntry.zone.length > 0) {
          locations.push(locationEntry);
        }
      }
    }
    if (locations.length > 0) {
      formData.append("location", JSON.stringify(locations));
    }

    if (selectedBrand) {
      formData.append("brand_Name", selectedBrand._id);
    }

    if (attributeValue.length > 0) {
      const variants = attributeValue
        .map((item, index) => {
          const prices = variantPrices[item.variantName];
          if (!prices || !prices.mrp || !prices.sell_price) {
            return null;
          }
          // Find the original variant data from the initial product data
          const originalVariant = originalProduct?.variants?.find(
            (v) => v.variantValue.split(" ")[0] === item.variantName
          );
          return {
            ...(originalVariant?._id && { _id: originalVariant._id }), // Include _id if it exists
            attributeName: item.attributeName,
            variantValue: `${item.variantName}${item.unit ? ` ${item.unit}` : ""}`,
            mrp: parseFloat(prices.mrp) || 0,
            sell_price: parseFloat(prices.sell_price) || 0,
            imageKey: `var${index + 1}`,
            ...(item.attributeName.toLowerCase() === "color" && colorHexCodes[item.variantName]
              ? { hexCode: colorHexCodes[item.variantName] }
              : {}),
          };
        })
        .filter(Boolean);
      if (variants.length > 0) {
        formData.append("variants", JSON.stringify(variants));
      }

      attributeValue
        .filter((item) => variantPrices[item.variantName])
        .forEach((item, index) => {
          if (variantImages[item.variantName]?.file) {
            formData.append(`var${index + 1}`, variantImages[item.variantName].file);
          }
        });
    }

    const combinedFilterData = {};
    originalFilterData.forEach((filter) => {
      if (filter._id && filter.selected?.length > 0) {
        combinedFilterData[filter._id] = {
          _id: filter._id,
          selected: filter.selected.map((s) => s._id).filter(Boolean),
        };
      }
    });

    Object.keys(selectedValuesByFilter).forEach((filterId) => {
      const filter = filters.find((f) => f._id === filterId);
      if (filter && filter._id) {
        const selectedIds = selectedValuesByFilter[filterId].map((val) => val._id).filter(Boolean);
        if (selectedIds.length > 0) {
          combinedFilterData[filterId] = {
            _id: filter._id,
            selected: selectedIds,
          };
        }
      }
    });

    const filterData = Object.values(combinedFilterData).filter(Boolean);
    if (filterData.length > 0) {
      formData.append("filter", JSON.stringify(filterData));
    }

    try {
      const result = await patch(`${ENDPOINTS.UPDATE_PRODUCT}/${id}`, formData);
      const responseBody = result.data;
      if (result.status === 200) {
        showAlert("success", "Product updated successfully");
        navigate(-1);
      } else {
        showAlert("error", responseBody.message || "Unknown server error");
      }
    } catch (err) {
      showAlert("error", "Error updating product: " + err.message);
    }
  };

  const selectedAttribute = attribute.find((attr) => attr._id === attributedata);
  const isColorAttribute = selectedAttribute?.Attribute_name?.toLowerCase() === "color";

  const handlefiltervalue = async () => {
    try {
      const newvalue = await patch(`${ENDPOINTS.EDIT_FILTER}/${filterTypeName}`, {
        Filter: [{ name: newFilterValue }],
      });
      if (newvalue.status === 200) {
        alert("Success");
        const res = await fetch(`https://node-m8jb.onrender.com/getfilter/${filterTypeName}`);
        const data = await res.json();
        setFilterValues(data.result?.Filter || []);
      }
    } catch (err) {
      console.log(err);
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
      <div className="container">
        <div className="inner-view">
          <h2 className="form-title">EDIT PRODUCT</h2>

          {/* Basic Information */}
          <div className="background" id="basicinfo">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "20px" }}>
              Basic Information
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Product Name <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Product Name"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ backgroundColor: "white" }}
                />
              </div>
              <div className="input-container">
                <label>
                  Description <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <textarea
                  placeholder="Enter Product Description"
                  className="input-field"
                  value={description}
                  style={{ backgroundColor: "white" }}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="row-section">
              <div className="input-container">
                <label>Ribbon</label>
                <input
                  type="text"
                  placeholder="Enter Ribbon Text"
                  className="input-field"
                  value={ribbon}
                  style={{ backgroundColor: "white" }}
                  onChange={(e) => setRibbon(e.target.value)}
                />
              </div>
            </div>
            <div className="row-section">
              <div className="input-container">
                <label>Feature Product</label>
                <Switch checked={isFeatured} onChange={handleFeatureToggle} color="primary" />
                <div style={{ fontWeight: "bold", color: isFeatured ? "green" : "gray" }}>
                  {isFeatured ? "✅ Featured Product" : "❌ Not Featured Product"}
                </div>
              </div>
              <div className="input-container">
                <label>
                  Return Policy <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={returnProduct.title === "No Return"}
                      onChange={() => handleReturnPolicyChange("No Return")}
                      style={{ marginRight: "8px" }}
                    />
                    No Return
                  </label>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={returnProduct.title === "No Exchange"}
                      onChange={() => handleReturnPolicyChange("No Exchange")}
                      style={{ marginRight: "8px" }}
                    />
                    No Exchange
                  </label>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={returnProduct.title === "3 Day Return"}
                      onChange={() => handleReturnPolicyChange("3 Day Return")}
                      style={{ marginRight: "8px" }}
                    />
                    3 Day Return
                  </label>
                  <div style={{ marginTop: "10px" }}>
                    <label>Return Policy Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      ref={returnImageInputRef}
                      onChange={handleReturnImageChange}
                      style={{ marginTop: "8px" }}
                    />
                    {returnProduct.image && (
                      <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
                        <img
                          src={`${process.env.REACT_APP_IMAGE_LINK}${URL.createObjectURL(
                            returnProduct.image
                          )}`}
                          alt="Return Policy Preview"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginRight: "10px",
                          }}
                        />
                        <button
                          onClick={handleRemoveReturnImage}
                          style={{
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="background">
            <div className="row-section">
              <div className="input-container">
                <label>
                  Is this a food product?{" "}
                  <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <Switch checked={isFood} onChange={() => setIsFood(!isFood)} color="primary" />
              </div>
            </div>

            {isFood && (
              <div className="row-section">
                <div className="input-container">
                  <label>
                    Select Type <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                  </label>
                  <label>
                    <input type="checkbox" checked={isVeg} onChange={() => setIsVeg(!isVeg)} />
                    Veg
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={isNonVeg}
                      onChange={() => setIsNonVeg(!isNonVeg)}
                    />
                    Non-Veg
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="background" id="imagesection">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Images
            </span>
            <div className="row-section">
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label>
                    Product Images <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input-field"
                    style={{ backgroundColor: "white" }}
                    disabled={selectedImages.length >= 4}
                  />
                  {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
                </div>
                <div
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "10px",
                    marginTop: "10px",
                    marginLeft: "20px",
                  }}
                >
                  {selectedImages.map((image, index) => {
                    const baseSize = 100;
                    const shrinkFactor = Math.min(1, 5 / selectedImages.length);
                    const size = baseSize * shrinkFactor;
                    return (
                      <img
                        key={image.newfiles + index}
                        src={`${process.env.REACT_APP_IMAGE_LINK}${image.newfiles}`}
                        alt={`preview-${index}`}
                        onClick={() => handleImageRemove(index)}
                        title="Click to remove"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="background" id="category-section">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Category Selection
            </span>
            <div className="row-section" style={{ flexDirection: "column" }}>
              <label>
                Select Category <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setCategory([selectedValue]);
                  setSelectedcategory(selectedValue);
                  setSubCategory("");
                  setSubSubCategory("");

                  const selectedCat = categories.find((cat) => cat._id === selectedValue);
                  const allSubCats = selectedCat?.subcat || [];
                  const allAttributes = selectedCat?.attribute || [];

                  setSubCategories(allSubCats);
                  setFilteredAttributes(allAttributes);
                }}
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <option value="">-- Select Category --</option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>

              {category.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <label>Selected Categories</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                    {category.map((catId) => {
                      const cat = categories.find((c) => c._id === catId);
                      return cat ? (
                        <div
                          key={catId}
                          style={{
                            backgroundColor: "#f0f0f0",
                            padding: "6px 10px",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          onClick={() => handleRemoveCategory(catId)}
                          title={`Click to remove ${cat.name}`}
                        >
                          {cat.name}
                          <span style={{ marginLeft: "5px", cursor: "pointer" }}>×</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {subCategories.length > 0 && (
                <>
                  <label>Select Sub-Category</label>
                  <select
                    className="input-field"
                    value={subCategory}
                    onChange={handleSubCategoryChange}
                  >
                    <option value="">--Select Sub-Category--</option>
                    {subCategories.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {subCategory && subsubCategories.length > 0 && (
                <>
                  <label>Select Sub-Sub-Category</label>
                  <select
                    className="input-field"
                    value={subSubCategory}
                    onChange={handleSubSubCategoryChange}
                  >
                    <option value="">--Select Sub Sub-Category--</option>
                    {subsubCategories.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* City & Zones */}
          <div className="background" id="citysection">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              City & Zones
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select City <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select className="input-field" value={city} onChange={handleCityChange}>
                  <option value="">--Select City--</option>
                  {citydata.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-container"></div>
            </div>
            {selectedCities.length > 0 && (
              <div className="row-section" style={{ flexDirection: "column" }}>
                <label>Selected Cities and Zones</label>
                {selectedCities.map((city) => (
                  <div key={city._id} style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontWeight: "bold", marginRight: "10px" }}>{city.city}</span>
                      <button
                        onClick={() => handleRemoveCity(city._id)}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove City
                      </button>
                    </div>
                    {cityZones[city._id]?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "10px",
                          border: "1px solid black",
                          minHeight: "40px",
                          padding: "10px",
                        }}
                      >
                        {cityZones[city._id].map((zoneAddress, zoneIndex) => (
                          <div
                            key={`${city._id}-${zoneIndex}`}
                            style={{
                              backgroundColor: "white",
                              boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
                              padding: "6px 10px",
                              borderRadius: "20px",
                              cursor: "pointer",
                              fontSize: "14px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            onClick={() => handleRemoveZoneFromCity(city._id, zoneAddress)}
                            title={`Click to remove ${zoneAddress}`}
                          >
                            {getDisplayZoneAddress(zoneAddress)}
                            <span style={{ marginLeft: "5px", cursor: "pointer" }}>×</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Units & Brands */}
          <div className="background" id="citysection">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Units & Brands
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select Units <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select
                  className="input-field"
                  value={unitname}
                  onChange={(e) => setUnitName(e.target.value)}
                >
                  <option value="">--Select Units--</option>
                  {unitsData.map((item) => (
                    <option key={item._id} value={item.unitname}>
                      {item.unitname}
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
                  onClick={() => setShowUnitPopup(true)}
                >
                  + ADD UNIT
                </h3>
                {showUnitPopup && (
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
                        placeholder="Enter Unit Name"
                        value={addUnit}
                        onChange={(e) => setAddUnit(e.target.value)}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <Button onClick={handleUnitData}>Save</Button>
                        <Button onClick={() => setShowUnitPopup(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="input-container">
                <label>Select Brand</label>
                <select
                  className="input-field"
                  value={selectedBrand?._id || ""}
                  onChange={(e) => {
                    const selected = brands.find((item) => item._id === e.target.value);
                    setSelectedBrand(selected);
                  }}
                >
                  <option value="">--Select Brand--</option>
                  {brands.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.brandName}
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
                  onClick={() => setShowbrandPopup(true)}
                >
                  + ADD BRAND
                </h3>
                {showbrandPopup && (
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
                        borderRadius: 15,
                        minWidth: 300,
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter Brand Name"
                        value={addBrand}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        ref={brandImageInputRef}
                        onChange={handleBrandImage}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                      />
                      {brandImage && (
                        <p style={{ fontSize: "12px", marginBottom: "10px" }}>
                          Selected: {brandImage.name}
                        </p>
                      )}
                      {brandImageError && (
                        <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
                          {brandImageError}
                        </p>
                      )}
                      <textarea
                        placeholder="Enter Brand Description"
                        value={des}
                        onChange={(e) => setDes(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "10px",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <Button onClick={handleBrand}>Save</Button>
                        <Button
                          onClick={() => {
                            setShowbrandPopup(false);
                            setBrand("");
                            setDes("");
                            setBrandImage(null);
                            if (brandImageInputRef.current) brandImageInputRef.current.value = "";
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter & Types */}
          <div className="background" id="citysection">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Filter & Types
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select Filter (Type){" "}
                  <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select
                  className="input-field"
                  value={filterTypeName}
                  onChange={async (e) => {
                    const selectedId = e.target.value;
                    setFilterTypeName(selectedId);
                    setSelectedFilterValue("");

                    try {
                      const res = await fetch(
                        `https://node-m8jb.onrender.com/getfilter/${selectedId}`
                      );
                      if (res.status === 200) {
                        const data = await res.json();
                        setFilterValues(data.result?.Filter || []);
                      } else {
                        setFilterValues([]);
                      }
                    } catch (error) {
                      console.error("Failed to fetch filter values:", error);
                      setFilterValues([]);
                    }
                  }}
                >
                  <option value="">--Select Filter--</option>
                  {filters.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                      style={{
                        fontWeight: filterTypeName === item._id ? "bold" : "normal",
                        backgroundColor: filterTypeName === item._id ? "#e0f7fa" : "white",
                      }}
                    >
                      {item.Filter_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-container">
                <label>Select Filter Value</label>
                <select
                  className="input-field"
                  value={selectedFilterValue}
                  onChange={handleFilterValueChange}
                >
                  <option value="">--Select Filter Value--</option>
                  {filterValues.map((val) => (
                    <option key={val._id} value={val._id}>
                      {val.name}
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
                  onClick={() => setAddFilterValuePopup(true)}
                >
                  + ADD FILTER VALUE
                </h3>
                {addfiltervaluepopup && (
                  <div className="popup-backdrop">
                    <div className="popup-content" style={{ borderRadius: 15 }}>
                      <input
                        type="text"
                        placeholder="Enter Filter Value"
                        value={newFilterValue}
                        onChange={(e) => setNewFilterValue(e.target.value)}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <Button onClick={handlefiltervalue}>Save</Button>
                        <Button
                          onClick={() => {
                            setAddFilterValuePopup(false);
                            setNewFilterValue("");
                          }}
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
                marginTop: "20px",
                marginLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {Object.entries(selectedValuesByFilter).map(([filterId, values]) => {
                const filterName =
                  filters.find((f) => f._id === filterId)?.Filter_name || "Unknown Filter";
                return (
                  <div key={filterId}>
                    <strong style={{ fontSize: "14px", color: "#007b83" }}>{filterName}</strong>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "5px" }}
                    >
                      {values.map((val) => (
                        <div
                          key={val._id}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "#e0f7fa",
                            borderRadius: "15px",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {val.name}
                          <span
                            onClick={() => {
                              setSelectedValuesByFilter((prev) => {
                                const updatedValues = (prev[filterId] || []).filter(
                                  (v) => v._id !== val._id
                                );
                                const updated = { ...prev, [filterId]: updatedValues };
                                if (updatedValues.length === 0) delete updated[filterId];
                                return updated;
                              });
                            }}
                            style={{
                              marginLeft: "6px",
                              cursor: "pointer",
                              color: "red",
                              fontWeight: "bold",
                            }}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attributes & Variants */}
          <div className="background" id="citysection">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Attributes & Variants
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select Attribute (Filter)
                  <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select
                  className="input-field"
                  value={attributedata}
                  onChange={(e) => setAttributeData(e.target.value)}
                >
                  <option value="">--Select Attribute--</option>
                  {filteredAttributes.map((attr) => {
                    const attributeObj = attribute.find((a) => a.Attribute_name === attr);
                    return attributeObj ? (
                      <option key={attributeObj._id} value={attributeObj._id}>
                        {attributeObj.Attribute_name}
                      </option>
                    ) : null;
                  })}
                </select>
                <h3
                  style={{
                    fontSize: "12px",
                    cursor: "pointer",
                    color: "green",
                    marginTop: "10px",
                    marginLeft: "5px",
                  }}
                  onClick={() => setShowPopup(true)}
                >
                  + ADD ATTRIBUTE
                </h3>
                {showPopup && (
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
                        maxWidth: 400,
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter attribute"
                        value={addAttribute}
                        onChange={(e) => setAddattribute(e.target.value)}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <Button onClick={handleAttribute}>Save</Button>
                        <Button onClick={() => setShowPopup(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="input-container">
                <label>
                  Select Variant
                  <span style={{ marginLeft: "5px", marginTop: "10px" }}> </span>
                </label>
                <select
                  className="input-field"
                  value=""
                  onChange={handleAttributeValueChange}
                  disabled={!attributedata}
                >
                  <option value="">--Select Variant--</option>
                  {attribute
                    .find((attr) => attr._id === attributedata)
                    ?.varient?.map((variant) => (
                      <option key={variant._id} value={variant.name}>
                        {variant.name} {unitname}
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
                  onClick={() => setShowVariantPopup(true)}
                >
                  + ADD VARIANT
                </h3>
                {showVariantPopup && (
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
                        placeholder="Enter variant value"
                        value={addVarient}
                        onChange={(e) => setAddVarient(e.target.value)}
                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <Button onClick={handleVarient}>Save</Button>
                        <Button onClick={() => setShowVariantPopup(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="row-section" style={{ flexWrap: "wrap", display: "flex" }}>
              {attributeValue.map((item, index) => {
                const variant = attribute
                  .find((attr) => attr._id === attributedata)
                  ?.varient?.find((v) => v.name === item.variantName);

                return (
                  <div
                    key={`${item.attributeName}-${item.variantName}-${index}`}
                    className="input-container"
                    style={{ flex: "1 0 30%", marginBottom: "20px" }}
                  >
                    <div style={{ marginBottom: "4px" }}>
                      <label style={{ fontSize: "14px" }}>
                        {item.attributeName} - {item.variantName}
                        {item.unit && !item.unit.includes(item.unitName) ? ` ${item.unit}` : ""}
                      </label>
                      <button
                        onClick={() => handleRemoveVariant(variant?._id, item.variantName)}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <input
                      type="number"
                      placeholder="Enter Variant MRP"
                      className="input-field"
                      value={variantPrices[item.variantName]?.mrp || ""}
                      onChange={(e) => handlePriceChange(item.variantName, "mrp", e.target.value)}
                    />

                    <input
                      type="number"
                      placeholder="Enter Variant Selling Price"
                      className="input-field"
                      value={variantPrices[item.variantName]?.sell_price || ""}
                      onChange={(e) =>
                        handlePriceChange(item.variantName, "sell_price", e.target.value)
                      }
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleVariantImageChange(item.variantName, e)}
                      className="input-field"
                      style={{ backgroundColor: "white", marginTop: "10px" }}
                    />

                    {variantImages[item.variantName]?.preview && (
                      <div style={{ marginTop: "10px" }}>
                        <img
                          src={`${process.env.REACT_APP_IMAGE_LINK}${
                            variantImages[item.variantName].preview
                          }`}
                          alt={`variant-preview-${item.variantName}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <button
                          onClick={() =>
                            setVariantImages((prev) => {
                              const updated = { ...prev };
                              delete updated[item.variantName];
                              return updated;
                            })
                          }
                          style={{
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            marginLeft: "10px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {item.attributeName.toLowerCase() === "color" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input
                          type="text"
                          placeholder="Hex Code"
                          className="input-field"
                          value={colorHexCodes[item.variantName] || ""}
                          style={{ backgroundColor: "white" }}
                          onClick={() => handleHexCodeClick(item.variantName)}
                          onChange={(e) => handleHexCodeChange(item.variantName, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {isColorAttribute && (
              <div className="input-container" style={{ width: "100%", padding: "20px" }}>
                <label>Select Colors (Global)</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    style={{ width: "100%", height: "40px", border: "none", cursor: "pointer" }}
                  />
                  <button
                    onClick={addColor}
                    style={{
                      padding: "8px 16px",
                      background: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                </div>
                {colorError && (
                  <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
                    {colorError}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        borderRadius: "8px",
                        minWidth: "100px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          backgroundColor: color.hex,
                          borderRadius: "50%",
                          marginBottom: "5px",
                          border: "1px solid #aaa",
                        }}
                      />
                      <div style={{ fontSize: "12px" }}>
                        <div style={{ fontWeight: "bold" }}>{color.name}</div>
                        <br />
                        {color.hex}
                      </div>
                      <button
                        onClick={() => removeColor(color.hex)}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          fontSize: "12px",
                          lineHeight: "20px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tax Section  */}
          <div className="background" id="taxsection">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Product Taxes
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  GST <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select
                  className="input-field"
                  value={cgst}
                  onChange={(e) => setCgst(e.target.value)}
                >
                  <option value="">--Select Tax Percentage--</option>
                  {taxdata.map((item) => (
                    <option key={item._id} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "30px", alignItems: "center", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              style={{ backgroundColor: "#00c853", color: "white", fontSize: "15px" }}
              onClick={handelProduct}
            >
              SAVE
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#00c853", color: "white", fontSize: "15px" }}
              onClick={() => navigate(-1)}
            >
              BACK
            </Button>
          </div>
        </div>

        <div className="sidebar-container">
          <span style={{ fontWeight: "bold" }}>Product Information</span>
          {[
            { id: "basicinfo", label: "Basic Information" },
            { id: "imagesection", label: "Image Section" },
            { id: "category-section", label: "Category Section" },
            { id: "citysection", label: "City & Attribute" },
            { id: "taxsection", label: "Tax Information" },
          ].map((item, index, array) => (
            <div key={item.id} style={{ position: "relative" }}>
              {index < array.length - 1 && (
                <div
                  className={`dashed-line ${
                    activeSection === item.id || array[index + 1].id === activeSection
                      ? "active"
                      : ""
                  }`}
                ></div>
              )}
              <a
                href={`#${item.id}`}
                className="sidebar-link-container"
                style={{ textDecoration: "none" }}
              >
                <span className={`dot ${activeSection === item.id ? "active" : ""}`}></span>
                <h5 className={`label-text ${activeSection === item.id ? "active" : ""}`}>
                  {item.label}
                </h5>
              </a>
            </div>
          ))}
        </div>
      </div>
    </MDBox>
  );
}

export default EditProduct;
