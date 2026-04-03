export const API_BASE_URL = "https://api.fivlia.com";
// export const API_BASE_URL = "https://api.fivlia.in";
// export const API_BASE_URL = "http://localhost:8080";
// export const API_BASE_URL = "https://api.fivlia.co.in";

// Define all endpoints here
export const ENDPOINTS = {
  GET_SMS_TYPE: "/getSmsType",

  // Products
  GET_TAX: "/getTax",
  GET_PRODUCTS: "/adminProducts",
  DELETE_PRODUCT: "/deleteProduct",
  TOGGLE_PUBLIC: "/edit-toggle",
  BULK_UPLOAD: "/Product/bulk",
  BULK_IMAGE_UPLOAD: "/bulkImageUpload",
  // Edit Product
  GET_ATTRIBUTES: "/getAttributes",
  ADD_ATTRIBUTE: "/addAtribute",
  GET_UNIT: "/getUnit",

  GET_CATEGORIES: "/categories",
  ADD_MAIN_CATEGORY: "/addMainCategory",
  ADD_SUB_CATEGORY: "/addSubCategory",
  ADD_SUBSUB_CATEGORY: "/addSubSubCategory",
  GET_SUB_CATEGORY: "/getSubCategory",
  GET_SUBSUB_CATEGORY: "/getSubSubCategory",
  GET_MAIN_CATEGORY: "/getMainCategory",
  ADD_FILTER_IN_CATEGORY: "/addFilterInCategory",
  GET_SUB_CATEGORIES: "/GetSubCategories",
  GET_SUB_SUB_CATEGORIES: "/GetSubSubCategories",

  UPDATE_ATTRIBUTE: "/updateAt",
  EDIT_FILTER: "/editFilter",
  UPDATE_PRODUCT: "/updateProduct",

  GET_DRIVER_REQUEST: "/getDriverRequest",
  DRIVER_APPROVAL: "/acceptDeclineRequest",
  EDIT_DRIVER: "/editDriver",

  GET_SELLER_REQUEST: "/getSellerRequest",
  APPROVAL_UPDATE: "/acceptDeclineRequest",

  GET_CHARITY: "/getCharity",
  ADD_CHARITY: "/addCharity",

  GET_CITY: "/getCity",
  GET_AVIABLE_CITY: "/getAviableCity",
  GET_ALL_ZONE: "/getAllZone",
  ADD_CITY_DATA: "/addcitydata",
  ADD_ZONE: "/add-location",
  DELETE_ZONE: "/deleteZone",
  UPDATE_CITY_STATUS: "/updateCityStatus",
  UPDATE_ZONE_STATUS: "/updateZoneStatus",
  ADD_UNIT: "/unit",

  DELETE_VARIANT: "/deleteVarient",
  DELETE_ATTRIBUTE: "/deleteAttribute",

  ADD_FILTER: "/addFilter",
  GET_FILTERS: "/getFilter",
  DELETE_FILTER_VALUE: "/deleteFilterVal",
  DELETE_FILTER: "/deleteFilter",

  ADD_DRIVER: "/driver",
  GET_DRIVERS: "/getDriver",
  GET_DRIVER_RATING: "/getDriverRating",
  GET_DRIVER_REFERRALS: "/get-driver-referral-seller",
  GET_WITHDRAWAL_REQUESTS: "/getWithdrawalRequest",
  WITHDRAWAL_ACTION: "/withdrawal",
  DELETE_DRIVER: "/deleteDriver",
  GET_DRIVER_TRANSACTIONS: "/transactionList",

  ADD_BANNER: "/banner",
  GET_ALL_BANNER: "/getAllBanner",
  UPDATE_BANNER_STATUS: "/admin/banner", // usage: /admin/banner/:id/status
  UPDATE_BANNER: "/admin/banner", // final url: /admin/banner/:id

  ADD_BRAND: "/brand",
  GET_BRANDS: "/getBrand",
  EDIT_BRAND: "/editBrand",

  ADD_BLOG: "/addBlog",
  EDIT_BLOG: "/editBlog",
  GET_BLOG_ADMIN: "/getBlog",

  GET_BULK_ORDERS: "/getBulkOrders",
  UPDATE_BULK_ORDERS: "/update-bulk-orders",
  ADD_VARIANT: "/addvarient",
  ADD_PRODUCT: "/products",

  GET_ALL_STORE: "/getAllStore",
  EDIT_STORE: "/storeEdit",
  CREATE_STORE: "/createStore",
  GENERATE_KEY: "/generateKey",
  EDIT_CATEGORY: "/editCat",
  GET_SELLER: "/getSeller",
  
  MARK_ALL_READ: "/markAllRead",
  GET_NOTIFICATION: "/getNotification",
  ADD_NOTIFICATION: "/notification",
  DELETE_NOTIFICATION: "/deleteNotification",
  EDIT_NOTIFICATION: "/editNotification",
  SEND_NOTIFICATION: "/send-notification",

  GET_CHARITY_CATEGORY: "/getCharity",
  GET_CHARITY_CONTENT: "/getCharityContent",

  UPDATE_CHARITY_CONTENT: "/updateCharityContent",
  CREATE_CHARITY_CONTENT: "/createCharityContent",

  GET_ORDERS: "/orders",
  GET_TEMP_ORDERS: "/get-temp-orders",
  GET_STORE: "/getStore",
  GET_DELIVERY_STATUS: "/getdeliveryStatus",
  UPDATE_ORDER_STATUS: "/orderStatus",
  INVOICE: "/thermal-invoice",
  DRIVER_WALLET: "/driverWallet",

  SET_COMMISSION: "/setCommison",

  UPDATE_DELIVERY_STATUS: "/updatedeliveryStatus",
  DELIVERY_STATUS: "/deliveryStatus",

  GET_SETTINGS: "/getSettings",
  ADMIN_SETTING: "/adminSetting",

  GET_SELLER_REPORT: "/get-seller-report",

  GET_EVENTS: "/getEvent",
  ADD_EVENT: "/addEvent",
  EDIT_EVENT: "/editEvent",

  GET_USERS: "/users",

  ADMIN_LOGIN: "/admin/login",

  GET_DOWNLOAD_APP_PAGES: "/getDownloadAppPages",
  ADD_DOWNLOAD_APP_PAGES: "/addDownloadAppPages",
  UPDATE_DOWNLOAD_APP_PAGES: (id) => `/updateDownloadApp/${id}`,
  DELETE_DOWNLOAD_APP_PAGES: (id) => `/deleteDownloadApp/${id}`,

  GET_EXPENSE_TYPE: "/getExpenseType",
  GET_EXPENSES: "/getExpenses",
  EDIT_EXPENSES: (id) => `/editExpenses/${id}`,
  ADD_EXPENSES: "/addExpenses",
  ADD_EXPENSE_TYPE: "/addExpenseType",

  GET_STAFF: "/getStaff",
  ADD_STAFF: "/addStaff",
  EDIT_STAFF: (id) => `/editStaff/${id}`,
  DELETE_STAFF: (id) => `/deleteStaff/${id}`,

  GET_ROLES: "/getRoles",
  ADD_ROLE: "/addRoles",

  WALLET_ADMIN: "/walletAdmin",
  ADMIN_TRANSACTION: "/adminTranaction",
  GET_DASHBOARD_STATS: "/getDashboardStats",

  GET_PAGE: "/getPage",
  EDIT_PAGE: "/editPage",
  ADD_PAGE: "/addPage",
  UPDATE_PAGE_STATUS: "/updatePageStatus",

  GET_FRANCHISE_ENQUIRY: "/get-frenchise-enquiry"
};
