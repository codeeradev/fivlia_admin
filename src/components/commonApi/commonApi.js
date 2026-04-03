// src/api/product.api.js
import { get, post, put, patch, del } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";

// Fallbacks in case ENDPOINTS doesn't contain these keys yet
const PRODUCTS_ENDPOINT = ENDPOINTS.ADD_PRODUCT || "/products";
const GET_TAX_ENDPOINT = ENDPOINTS.GET_TAX || "/getTax";

export const getAllTaxes = () => get(GET_TAX_ENDPOINT);

export const createProduct = (formData, config = {}) =>
  // formData should be FormData instance
  post(PRODUCTS_ENDPOINT, formData, config);

export const uploadBulkProducts = (formData, config = {}) =>
  post(ENDPOINTS.BULK_UPLOAD || "/Product/bulk", formData, config);

export const uploadBulkImages = (formData, config = {}) =>
  post(ENDPOINTS.BULK_IMAGE_UPLOAD || "/bulkImageUpload", formData, config);

//city
export const getAllZones = () => get(ENDPOINTS.GET_ALL_ZONE || "/getAllZone");

export const getCities = () => get(ENDPOINTS.GET_CITY || "/getCity");

// export other city endpoints if required (updateCityStatus, etc.)
export const updateCityStatus = (cityId, data, config = {}) =>
  put(`${ENDPOINTS.UPDATE_CITY_STATUS || "/updateCityStatus"}/${cityId}`, data, config);

//Category
export const getMainCategories = () => get(ENDPOINTS.GET_MAIN_CATEGORY || "/getMainCategory");

export const createMainCategory = (data, config = {}) =>
  post(ENDPOINTS.ADD_MAIN_CATEGORY || "/addMainCategory", data, config);

export const createSubCategory = (data, config = {}) =>
  post(ENDPOINTS.ADD_SUB_CATEGORY || "/addSubCategory", data, config);

export const createSubSubCategory = (data, config = {}) =>
  post(ENDPOINTS.ADD_SUBSUB_CATEGORY || "/addSubSubCategory", data, config);

export const getSubCategories = () => get(ENDPOINTS.GET_SUB_CATEGORY || "/getSubCategory");

export const getSubSubCategories = () => get(ENDPOINTS.GET_SUBSUB_CATEGORY || "/getSubSubCategory");

export const addFilterInCategory = (data, config = {}) =>
  post(ENDPOINTS.ADD_FILTER_IN_CATEGORY || "/addFilterInCategory", data, config);

//brand
export const getAllBrands = () => get(ENDPOINTS.GET_BRANDS || "/getBrand");

// formData required
export const createBrand = (formData, config = {}) =>
  post(ENDPOINTS.ADD_BRAND || "/brand", formData, config);

export const editBrand = (brandId, formData, config = {}) =>
  put(`${ENDPOINTS.EDIT_BRAND || "/editBrand"}/${brandId}`, formData, config);

//attributes
export const getAllAttributes = () => get(ENDPOINTS.GET_ATTRIBUTES || "/getAttributes");

// Adds attribute to a category: PATCH /updateAt/:categoryId
export const addAttributeToCategory = (categoryId, payload, config = {}) =>
  patch(`${ENDPOINTS.UPDATE_ATTRIBUTE || "/updateAt"}/${categoryId}`, payload, config);

// delete attribute by id (if needed)
export const deleteAttributeById = (attributeId, config = {}) =>
  del(`${ENDPOINTS.DELETE_ATTRIBUTE || "/deleteAttribute"}/${attributeId}`, config);

//filters
export const getAllFilters = () => get(ENDPOINTS.GET_FILTERS || "/getFilter");

// Add filter type (POST /addFilter)
export const createFilterType = (payload, config = {}) =>
  post(ENDPOINTS.ADD_FILTER || "/addFilter", payload, config);

// Add filter value to existing filter type (same endpoint /addFilter with body {_id, Filter: [...]})
export const createFilterValue = (payload, config = {}) =>
  post(ENDPOINTS.ADD_FILTER || "/addFilter", payload, config);

// Delete filter value
export const deleteFilterValue = (filterId, valueId, config = {}) =>
  del(`${ENDPOINTS.DELETE_FILTER_VALUE || "/deleteFilterVal"}/${filterId}/${valueId}`, config);

// Delete filter
export const deleteFilter = (filterId, config = {}) =>
  del(`${ENDPOINTS.DELETE_FILTER || "/deleteFilter"}/${filterId}`, config);

// Edit filter (if supported)
export const editFilter = (filterId, payload, config = {}) =>
  put(`${ENDPOINTS.EDIT_FILTER || "/editFilter"}/${filterId}`, payload, config);

//units
export const getAllUnits = () => get(ENDPOINTS.GET_UNIT || "/getUnit");

export const createUnit = (payload, config = {}) =>
  post(ENDPOINTS.ADD_UNIT || "/unit", payload, config);

//variant
// endpoint name fallback: addvarient
const ADD_VARIANT_ENDPOINT = ENDPOINTS.ADD_VARIANT || "/addvarient";
const DELETE_VARIANT_ENDPOINT = ENDPOINTS.DELETE_VARIANT || "/deleteVarient";

export const addVariant = (attributeId, body, config = {}) =>
  // PUT /addvarient/:attributeId
  put(`${ADD_VARIANT_ENDPOINT}/${attributeId}`, body, config);

export const deleteVariantById = (variantId, config = {}) =>
  // DELETE /deleteVarient/:id
  del(`${DELETE_VARIANT_ENDPOINT}/${variantId}`, config);
