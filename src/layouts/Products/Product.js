import React, { useEffect, useState, useRef } from "react";
import MDBox from "components/MDBox";
import { startLoading, stopLoading } from "components/loader/appSlice";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import "./Product.css";
import ColorNamer from "color-namer";
import { Button, Switch } from "@mui/material";
import { showAlert } from "components/commonFunction/alertsLoader";
import {
  getMainCategories,
  getAllBrands,
  getAllUnits,
  getAllFilters,
  getAllZones,
  getAllTaxes,
  getAllAttributes,
} from "components/commonApi/commonApi";
import { get, post, put, patch, del } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

function Product() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");
  const [variantPrices, setVariantPrices] = useState({});
  const [colorHexCodes, setColorHexCodes] = useState({});
  const [colorError, setColorError] = useState("");
  const [activeVariant, setActiveVariant] = useState("");
  const [filterdropdown, setFilterDropdown] = useState(false);
  const [returnProduct, setReturnProduct] = useState({ title: "No Return", image: null });
  const returnImageInputRef = useRef(null);
  const [allFilters, setAllFilters] = useState([]);

  const sectionIds = [
    "basicinfo",
    "imagesection",
    "thumbnail-section",
    "category-section",
    "citysection",
    "unit-section",
    "attributes",
    "filter-type",
    "taxsection",
  ];

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subsubCategories, setSubsubCategories] = useState([]);
  const [citydata, setCityData] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [cityZones, setCityZones] = useState({});

  // Basic Product Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ribbon, setRibbon] = useState("");
  const [mrp, setMrp] = useState("");
  const [sellingprice, setSellingPrice] = useState("");
  const [minqty, setMinQty] = useState("");
  const [maxqty, setMaxQty] = useState("");
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
  const thumbnailInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const [filterData, setFilterData] = useState([]);
  const [showfilterdropdown, setShowFilterDropdown] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [subSubCategory, setSubSubCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [city, setCity] = useState("");
  const [zone, setZone] = useState([]);
  const [attribute, setAttribute] = useState([]);
  const [filteredAttributes, setFilteredAttributes] = useState([]);
  const [attributeValue, setAttributeValue] = useState([]);
  const [taxdata, setTaxData] = useState([]);
  const [cgst, setCgst] = useState("");
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
  const [filterName, setFilterName] = useState("");
  const [filterpopup, setFilterPopup] = useState(false);
  const [filtertype, setFilterTypes] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);
  const [filterValues, setFilterValues] = useState([]);
  const [selectedfilterarray, setSelectedFilterArray] = useState([]);
  const [variantMrps, setVariantMrps] = useState({});
  const [variantImages, setVariantImages] = useState({});
  const [addFilterValue, setAddFilterValue] = useState("");
  const [newfiltertype, setNewfilterType] = useState([]);
  const [isFood, setIsFood] = useState(false);
  const [isVeg, setIsVeg] = useState(false);
  const [isNonVeg, setIsNonVeg] = useState(false);

  const maxSize = 500 * 1024; // 500KB

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await getAllFilters();
        setFilterTypes(res.data);
      } catch (err) {
        console.error("Error fetching Filters:", err);
      }
    };
    fetchFilters();

    const getCategory = async () => {
      try {
        const res = await getMainCategories();
        setCategories(res.data.result);
      } catch (err) {
        console.log(err);
      }
    };
    getCategory();

    const getActiveCity = async () => {
      try {
        const res = await getAllZones();
        const data = res.data;

        setCityData(data);
        const allCities = data;
        setSelectedCities(data);
        const zonesMap = {};
        allCities.forEach((city) => {
          zonesMap[city._id] = city.zones.map((zone) => zone.address);
        });
        setCityZones(zonesMap);
        // Optionally set the first city as the active city
        if (allCities.length > 0) {
          setCity(allCities[0]._id);
          setZones(allCities[0].zones.map((zone) => zone.address));
        }
      } catch (err) {
        console.log(err);
      }
    };
    getActiveCity();

    const fetchBrands = async () => {
      try {
        const res = await getAllBrands();
        setBrands(res.data.allBrands);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };
    fetchBrands();

    const getTax = async () => {
      try {
        const res = await getAllTaxes();
        setTaxData(res.data.result);
      } catch (err) {
        console.error("Error fetching taxes:", err);
      }
    };
    getTax();

    const fetchAttribute = async () => {
      try {
        const res = await getAllAttributes();
        setAttribute(res.data);
      } catch (err) {
        console.error("Error fetching attributes:", err);
      }
    };
    fetchAttribute();

    const getUnits = async () => {
      try {
        const res = await getAllUnits();
        setUnitsData(res.data.Result);
      } catch (err) {
        console.log(err);
      }
    };
    getUnits();

    const handleScroll = () => {
      let current = "";
      let closestTop = Infinity;

      for (let id of sectionIds) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          const top = rect.top;
          const sectionHeight = rect.height;

          // Consider a section active if its top is near the viewport top and it's at least partially visible
          if (top <= 150 && top > -sectionHeight && Math.abs(top) < Math.abs(closestTop)) {
            current = id;
            closestTop = top;
          }
        } else {
          console.warn(`Section with ID ${id} not found in DOM`); // Debugging
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const removeFilter = (filterId) => {
    setAllFilters((prev) => prev.filter((f) => f._id !== filterId));
  };

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

  const handleFilterType = async () => {
    if (!selectedFilter) {
      showAlert("error", "Please select filter first");
      return;
    }
    if (!addFilterValue.trim()) {
      showAlert("error", "Enter filter value");
      return;
    }
    try {
      showAlert("loading", "Adding filter value...");

      const result = await post(ENDPOINTS.ADD_FILTER, {
        _id: selectedFilter,
        Filter: [{ name: addFilterValue }],
      });

      if (result.status === 200) {
        showAlert("success", "Filter value added");
        setShowFilterDropdown(false);
        setAddFilterValue("");
        const selectedFilterObj = filtertype.find((filter) => filter._id === selectedFilter);
        if (selectedFilterObj) {
          setFilterValues([...selectedFilterObj.Filter, { name: addFilterValue, _id: "new_id" }]);
        }
      } else {
        showAlert("error", "Something Went Wrong");
      }
    } catch (err) {
      console.log(err);
      showAlert("error", "Something Went Wrong");
    }
  };

  const handlePriceChange = (variantName, price) => {
    setVariantPrices((prev) => ({
      ...prev,
      [variantName]: price,
    }));
  };

  const handleMrpChange = (variantName, mrp) => {
    setVariantMrps((prev) => ({
      ...prev,
      [variantName]: mrp,
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

  const handleRemoveFilterValue = (valueId) => {
    setSelectedFilterArray((prev) => prev.filter((v) => v !== valueId));
  };

  const handleAttributeValueChange = (variantName) => {
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
          },
        ];
        setAttributeValue(newAttributeValue);
        if (selectedAttr.Attribute_name.toLowerCase() === "color") {
          setActiveVariant(variantName);
        }
      }
    }
    setShowVariantDropdown(false);
  };

  const handleDeleteVariant = async (id, variantName) => {
    if (!window.confirm(`Are you sure you want to delete the variant "${variantName}"?`)) {
      return;
    }

    try {
      showAlert("loading", "Deleting variant...");
      const result = await fetch(`https://node-m8jb.onrender.com/deleteVarient/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (result.status === 200) {
        showAlert("success", "Variant deleted");
        const attr = await getAllAttributes();
        setAttribute(attr.data);

        setAttributeValue((prev) => prev.filter((item) => item.variantName !== variantName));
        setShowVariantDropdown(false);
      } else {
        showAlert("error", "Error deleting variant");
      }
    } catch (err) {
      console.error("Error deleting variant:", err);
      showAlert("error", err.message);
    }
  };

  const handleCategoryChange = (categoryId) => {
    let updatedCategories;
    if (category.includes(categoryId)) {
      updatedCategories = category.filter((id) => id !== categoryId);
    } else {
      updatedCategories = [...category, categoryId];
    }

    setCategory(updatedCategories);
    setSubCategory("");
    setSubSubCategory("");
    setAttributeValue([]);
    setAttributeData("");

    if (updatedCategories.length > 0) {
      const selectedCats = categories.filter((cat) => updatedCategories.includes(cat._id));
      const allSubCats = [
        ...new Set(
          selectedCats.flatMap((cat) => cat.subcat || []).map((sub) => JSON.stringify(sub))
        ),
      ].map((sub) => JSON.parse(sub));
      setSubCategories(allSubCats);

      const allAttributes = [...new Set(selectedCats.flatMap((cat) => cat.attribute || []))];
      setFilteredAttributes(allAttributes);

      const allFilterType = [...new Set(selectedCats.flatMap((cat) => cat.filter || []))];
      setNewfilterType(allFilterType);
    } else {
      setSubCategories([]);
      setSubsubCategories([]);
      setFilteredAttributes([]);
      setFilterTypes([]);
    }

    setShowCategoryDropdown(false);
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
    setAttributeValue([]);
    setAttributeData("");
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

  const handleSidenavClick = (id) => {
    const section = document.getElementById(id);
    if (section) {
      // Scroll to the section with an offset to account for headers
      const offset = 80; // Adjust based on your header height
      const topPos = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: topPos, behavior: "smooth" });
      setActiveSection(id); // Manually set the active section
    }
  };

  const handleFilter = async () => {
    try {
      showAlert("loading", "Adding filter...");

      const result = await post(ENDPOINTS.ADD_FILTER, {
        Filter_name: filterName,
      });

      if (result.status === 200) {
        showAlert("success", "Filter added successfully");
        setFilterPopup(false);
        setFilterName("");
        const selectedCats = categories.filter((cat) => category.includes(cat._id));
        const allFilterType = selectedCats
          .flatMap((cat) => cat.filter || [])
          .filter((fil, index, self) => index === self.findIndex((a) => a === fil));
        setFilterTypes(allFilterType);
      } else {
        showAlert("error", "Error adding filter");
      }
    } catch (err) {
      showAlert("error", err.message);
      console.log(err);
    }
  };

  const handleAttribute = async () => {
    if (!addAttribute.trim()) {
      showAlert("error", "Please enter attribute name");
      return;
    }

    const selectedCategoryId = category[0];

    try {
      showAlert("loading", "Adding attribute...");

      const result = await patch(`${ENDPOINTS.UPDATE_ATTRIBUTE}/${selectedCategoryId}`, {
        attribute: addAttribute,
      });

      if (result.status === 200) {
        showAlert("success", "Attribute added successfully");
        setShowPopup(false);
        setAddattribute("");
        const attr = await getAllAttributes();
        setAttribute(attr.data);
      } else {
        showAlert("error", "Error adding attribute");
      }
    } catch (err) {
      showAlert("error", err.message);
      console.error("Error adding attribute:", err);
    }
  };

  const handleVarient = async () => {
    if (!attributedata) {
      showAlert("error", "Please select attribute first");
      return;
    }

    if (!addVarient.trim()) {
      showAlert("error", "Please enter variant name");
      return;
    }

    try {
      showAlert("loading", "Adding variant...");
      const result = await put(`${ENDPOINTS.ADD_VARIANT}/${attributedata}`, {
        name: addVarient,
      });

      if (result.status === 200) {
        showAlert("success", "Variant added successfully");
        setShowVariantPopup(false);
        setAddVarient("");

        const attr = await getAllAttributes();
        setAttribute(attr.data);
      } else {
        showAlert("error", "Error adding variant");
      }
    } catch (err) {
      console.error("Error adding variant:", err);
      showAlert("error", err.message);
    }
  };

  const handleUnitData = async () => {
    if (!addUnit.trim()) {
      showAlert("error", "Please input unit name");
      return;
    }

    try {
      showAlert("loading", "Adding unit...");
      const result = await post(ENDPOINTS.ADD_UNIT, {
        unitname: addUnit,
      });
      if (result.status === 200) {
        showAlert("success", "Unit added successfully");
        setShowUnitPopup(false);
        setAddUnit("");

        const units = await getAllUnits();
        setUnitsData(units.data.Result);
      } else {
        showAlert("error", "Error adding unit");
      }
    } catch (err) {
      showAlert("error", err.message);
      console.log(err);
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

      const maxSizeInBytes = 500 * 1024; // 500KB
      if (file.size > maxSizeInBytes) {
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
      showAlert("error", "Please enter brand name");
      return;
    }
    const formData = new FormData();
    formData.append("brandName", addBrand);
    formData.append("description", des);
    if (brandImage) {
      formData.append("image", brandImage);
    }

    try {
      showAlert("loading", "Adding brand...");

      const result = await post(ENDPOINTS.ADD_BRAND, formData);

      if (result.status === 200) {
        showAlert("success", "Brand added successfully");
        setShowbrandPopup(false);
        setBrand("");
        setDes("");
        setBrandImage(null);
        if (brandImageInputRef.current) brandImageInputRef.current.value = "";

        const res = await getAllBrands();
        setBrands(res.data.allBrands);
      } else {
        showAlert("error", "Error adding brand");
      }
    } catch (err) {
      showAlert("error", err.message);
      console.log(err);
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setCity(cityId);

    const selectedCity = citydata.find((item) => item._id === cityId);
    if (selectedCity) {
      const cityZones = selectedCity.zones || [];
      setZones(cityZones.map((zone) => zone.address));
    } else {
      setZones([]);
      setZone([]);
    }
  };

  const handleRemoveZone = (zoneAddress) => {
    setZone((prev) => prev.filter((z) => z !== zoneAddress));
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
    if (parts.length <= 2) {
      return zoneAddress;
    }
    return parts.slice(0, 2).join(",").trim();
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
        setColorHexCodes((prev) => ({
          ...prev,
          [activeVariant]: currentColor,
        }));
      } else {
        const colorVariants = attributeValue.filter(
          (item) => item.attributeName.toLowerCase() === "color"
        );
        if (colorVariants.length > 0) {
          const latestColorVariant = colorVariants[colorVariants.length - 1];
          setColorHexCodes((prev) => ({
            ...prev,
            [latestColorVariant.variantName]: currentColor,
          }));
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
        if (updated[key] === hexToRemove) {
          updated[key] = "";
        }
      });
      return updated;
    });
  };

  const handleHexCodeClick = (variantName) => {
    setActiveVariant(variantName);
  };

  const selectedAttribute = attribute.find((attr) => attr._id === attributedata);
  const isColorAttribute = selectedAttribute?.Attribute_name?.toLowerCase() === "color";

  const handleFeatureToggle = (event) => {
    setIsFeatured(event.target.checked);
  };

  const handleFilterChange = (e) => {
    const filterId = e.target.value;
    setSelectedFilter(filterId);

    const selectedFilterObj = filtertype.find((f) => f._id === filterId);
    if (selectedFilterObj && selectedFilterObj.Filter) {
      setFilterValues(selectedFilterObj.Filter);
    } else {
      setFilterValues([]);
    }
  };

  const handleFilterValueToggle = (valueId) => {
    setAllFilters((prev) => {
      const existingFilter = prev.find((f) => f._id === selectedFilter);

      if (existingFilter) {
        const isSelected = existingFilter.selected.includes(valueId);
        const updatedSelected = isSelected
          ? existingFilter.selected.filter((id) => id !== valueId)
          : [...existingFilter.selected, valueId];

        return prev.map((f) =>
          f._id === selectedFilter ? { ...f, selected: updatedSelected } : f
        );
      } else {
        return [...prev, { _id: selectedFilter, selected: [valueId] }];
      }
    });
  };

  const handelProduct = async () => {
    showAlert("loading", "Saving product...");

    const hasVariantImage = attributeValue.some((item) => variantImages[item.variantName]?.file);
    if (attributeValue.length > 0 && !hasVariantImage) {
      showAlert("error","At least one variant must have an image.");
      return;
    }
    const formData = new FormData();
    formData.append("productName", name);
    formData.append("description", description);
    formData.append("ribbon", ribbon);
    formData.append("mrp", mrp);
    formData.append("sell_price", sellingprice);
    formData.append("feature_product", isFeatured);

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
      formData.append("image", thumbnailImage); // Changed from "image" to "thumbnail"
    }

    selectedImages.forEach((file) => {
      formData.append("MultipleImage", file.file);
    });

    formData.append("category", JSON.stringify(category));

    if (subCategory) {
      formData.append("subCategory", subCategory);
    }

    if (subSubCategory) {
      formData.append("subSubCategory", subSubCategory);
    }

    const locations = [];
    if (selectedCities.length > 0) {
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
    }

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
      formData.append("brand_Name", selectedBrand.brandName);
    }
    formData.append("unit", unitname);
    formData.append("tax", cgst);

    if (attributeValue.length > 0) {
      const variants = attributeValue
        .filter((item) => variantPrices[item.variantName])
        .map((item, index) => ({
          sell_price: parseFloat(variantPrices[item.variantName]) || 0,
          mrp: parseFloat(variantMrps[item.variantName]) || 0,
          variantValue: item.variantName + unitname,
          attributeName: item.attributeName,
          imageKey: `var${index + 1}`,
          ...(item.attributeName.toLowerCase() === "color" && colorHexCodes[item.variantName]
            ? { hexCode: colorHexCodes[item.variantName] }
            : {}),
        }));
      for (const variant of variants) {
        if (variant.sell_price > variant.mrp) {
          showAlert("error",`Selling Price for variant "${variant.variantValue}" cannot be greater than MRP.`);
          return null;
        }
      }
      formData.append("variants", JSON.stringify(variants));

      attributeValue
        .filter((item) => variantPrices[item.variantName])
        .forEach((item, index) => {
          if (variantImages[item.variantName]?.file) {
            formData.append(`var${index + 1}`, variantImages[item.variantName].file);
          }
        });
    }

    if (allFilters.length > 0) {
      formData.append("filter", JSON.stringify(allFilters));
    }

    try {
      const result = await post(ENDPOINTS.ADD_PRODUCT, formData);

      if (result.status === 200) {
        showAlert("success", "Product added successfully!", 2000);
        setTimeout(() => navigate(-1), 500);
      } else {
        showAlert("error", "Failed to save product.");
      }
    } catch (err) {
      showAlert("error", err.message || "Something went wrong");
      console.log(err);
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
      <div className="container">
        <div className="inner-view">
          <h2 className="form-title">ADD NEW PRODUCT</h2>

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
              <div style={{ display: "flex", flexDirection: "row" }}>
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
                        key={index}
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
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {category.length > 0
                    ? categories
                        .filter((cat) => category.includes(cat._id))
                        .map((cat) => cat.name)
                        .join(", ") || "--Select Category--"
                    : "--Select Category--"}
                </button>
                {showCategoryDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {categories.map((item) => (
                      <div
                        key={item._id}
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #eee",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={category.includes(item._id)}
                          onChange={() => handleCategoryChange(item._id)}
                          style={{ marginRight: "8px" }}
                        />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

          {/* City & Zone */}
          <div className="background" id="citysection">
            <span style={{ marginLeft: "20px", fontWeight: "bold" }}>City & Zones</span>
            <div
              style={{
                marginLeft: "20px",
                marginRight: "20px",
                marginBottom: "20px",
                marginTop: "20px",
              }}
            >
              <div className="input-container" style={{ width: "100%" }}>
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
                            key={zoneIndex}
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

          {/* Unit Section */}
          <div className="background" id="unit-section">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Units & Brands
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select Units <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select className="input-field" onChange={(e) => setUnitName(e.target.value)}>
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
                  onChange={(e) => {
                    const selected = brands.find((item) => item._id === e.target.value);
                    setSelectedBrand(selected);
                  }}
                >
                  <option value="">--Select Brand--</option>
                  {Array.isArray(brands) && brands.length > 0 ? (
                    brands.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.brandName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No brands available
                    </option>
                  )}
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
                            if (brandImageInputRef.current) {
                              brandImageInputRef.current.value = "";
                            }
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

          {/* Attributes */}
          <div className="background" id="attributes">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Attributes & Variants
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select Attribute (Filter){" "}
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
                        minWidth: 300,
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
                  Select Variant (Filter Variant){" "}
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
                    onClick={() => setShowVariantDropdown(!showVariantDropdown)}
                  >
                    {attributeValue.length > 0 && attributedata
                      ? attributeValue
                          .filter(
                            (item) => item.attributeName === selectedAttribute?.Attribute_name
                          )
                          .map((item) => item.variantName)
                          .join(", ") || "--Select Attribute Value--"
                      : "--Select Attribute Value--"}
                  </button>
                  {showVariantDropdown && attributedata && (
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
                      {attribute
                        .find((attr) => attr._id === attributedata)
                        ?.varient?.map((variant, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px",
                              borderBottom: "1px solid #eee",
                              cursor: "pointer",
                            }}
                          >
                            <span
                              onClick={() => handleAttributeValueChange(variant.name)}
                              style={{ flex: 1 }}
                            >
                              {variant.name + unitname}
                            </span>
                            <button
                              onClick={() => handleDeleteVariant(variant._id, variant.name)}
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
                              Delete
                            </button>
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

            <div className="row-section" style={{ flexWrap: "wrap" }}>
              {attributeValue.map((item, index) => (
                <div
                  key={index}
                  className="input-container"
                  style={{ flex: "1 0 30%", marginBottom: "20px" }}
                >
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ fontSize: "15px" }}>
                      {item.attributeName} - {item.variantName + unitname}
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Variant MRP"
                    className="input-field"
                    value={variantMrps[item.variantName] || ""}
                    style={{ backgroundColor: "white", marginBottom: "10px" }}
                    onChange={(e) => handleMrpChange(item.variantName, e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Enter Variant Selling Price"
                    className="input-field"
                    value={variantPrices[item.variantName] || ""}
                    style={{ backgroundColor: "white", marginBottom: "10px" }}
                    onChange={(e) => handlePriceChange(item.variantName, e.target.value)}
                  />
                  {item.attributeName.toLowerCase() === "color" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Hex Code"
                        className="input-field"
                        value={colorHexCodes[item.variantName] || ""}
                        style={{ backgroundColor: "white", marginBottom: "10px" }}
                        onClick={() => handleHexCodeClick(item.variantName)}
                        onChange={(e) => handleHexCodeChange(item.variantName, e.target.value)}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleVariantImageChange(item.variantName, e)}
                    style={{ marginBottom: "10px" }}
                  />
                  {variantImages[item.variantName]?.preview && (
                    <img
                      src={`${process.env.REACT_APP_IMAGE_LINK}${
                        variantImages[item.variantName].preview
                      }`}
                      alt={`Preview for ${item.variantName}`}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "10px",
                      }}
                    />
                  )}
                </div>
              ))}
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
                      cursor: "pointer",
                      borderRadius: "5px",
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
                        <strong>{color.name}</strong>
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

          {/* Filter & Types */}
          <div className="background" id="filter-type">
            <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              Filters & Types
            </span>
            <div className="row-section">
              <div className="input-container">
                <label>
                  Select Filter (Type){" "}
                  <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
                </label>
                <select
                  className="input-field"
                  value={selectedFilter}
                  onChange={handleFilterChange}
                >
                  <option value="">--Select Filter--</option>
                  {filtertype.map((filter) => (
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

                {filterpopup && (
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
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <Button onClick={handleFilter}>Save</Button>
                        <Button onClick={() => setFilterPopup(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {allFilters.map((filter) => {
                    const filterName =
                      filtertype.find((f) => f._id === filter._id)?.Filter_name || "Unnamed";
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
                  Select Filter Value{" "}
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
                    onClick={() => setFilterDropdown(!filterdropdown)}
                  >
                    {selectedfilterarray.length > 0
                      ? `${selectedfilterarray.length} value(s) selected`
                      : "--Select Filter Value--"}
                  </button>
                  {filterdropdown && (
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

                {showfilterdropdown && (
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
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
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
              {selectedfilterarray.map((valueId, index) => {
                const value = filterValues.find((v) => v._id === valueId);
                return value ? (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#f0f0f0",
                      padding: "6px 10px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <span>{value.name}</span>
                    <span
                      style={{ marginLeft: "5px", cursor: "pointer" }}
                      onClick={() => handleRemoveFilterValue(valueId)}
                    >
                      ×
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Tax Section */}
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
            { id: "citysection", label: "City & Zones" },
            { id: "unit-section", label: "Units & Brands" },
            { id: "attributes", label: "Attributes & Variants" },
            { id: "filter-type", label: "Filter & Types" },
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
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor behavior
                  handleSidenavClick(item.id);
                }}
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

export default Product;
