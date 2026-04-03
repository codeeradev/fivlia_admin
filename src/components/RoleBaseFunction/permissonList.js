const PERMISSION_LIST = {
  // -----------------------------
  // CORE CRUD MODULES
  // -----------------------------
  Festival: [
    "FESTIVAL_VIEW",
    "FESTIVAL_ADD_EDIT",
    "FESTIVAL_DELETE",
  ],

  Brands: [
    "BRAND_VIEW",
    "BRAND_ADD_EDIT",
    "BRAND_DELETE",
  ],

  DownloadPages: [
    "APP_DOWNLOAD_VIEW",
    "APP_DOWNLOAD_ADD_EDIT",
    "APP_DOWNLOAD_DELETE",
  ],

  Charities: [
    "CHARITY_VIEW",
    "CHARITY_ADD_EDIT",
    "CHARITY_DELETE",
  ],

  // -----------------------------
  // FINANCE / COMMISSION / WITHDRAWAL
  // -----------------------------
  Finance: [
    "FINANCE_VIEW",
    "FINANCE_MANAGE",
  ],

  Commission: [
    "COMMISSION_MANAGE",
  ],

  Approvals: [
    "APPROVAL_VIEW",
    "APPROVAL_MANAGE",
  ],

  // -----------------------------
  // STAFF MANAGEMENT (ONE CRUD FOR BOTH)
  // -----------------------------
  StaffManagement: [
    "STAFF_VIEW",
    "STAFF_ADD_EDIT",
    "STAFF_DELETE",
  ],

  // -----------------------------
  // ATTRIBUTES (GROUP)
  // -----------------------------
  Attributes: [
    "ATTRIBUTE_VIEW",
    "ATTRIBUTE_ADD_EDIT",
    "ATTRIBUTE_DELETE",
  ],

  // -----------------------------
  // NOTIFICATIONS
  // -----------------------------
  Notifications: [
    "NOTIFICATION_VIEW",
    "NOTIFICATION_MANAGE",
  ],

  // -----------------------------
  // SEO SETTINGS (GROUP)
  // -----------------------------
  SEO: [
    "SEO_VIEW",
    "SEO_ADD_EDIT",
    "SEO_DELETE",
  ],

  // -----------------------------
  // SETTINGS (SEPARATE)
  // -----------------------------
  AppSettings: [
    "APP_SETTINGS_VIEW",
    "APP_SETTINGS_ADD_EDIT",
  ],

  Pages: [
    "PAGES_VIEW",
    "PAGES_ADD_EDIT",
    "PAGES_DELETE",
  ],

  OrderSettings: [
    "ORDER_SETTINGS_VIEW",
    "ORDER_SETTINGS_ADD_EDIT",
  ],

  // -----------------------------
  // EXISTING MODULES (from your old list)
  // -----------------------------
  Cities: [
    "CITY_VIEW",
    "CITY_ADD_EDIT",
    "CITY_DELETE",
  ],

  Orders: [
    "ORDER_VIEW",
    "ORDER_MANAGE",
  ],

  Products: [
    "PRODUCT_VIEW",
    "PRODUCT_ADD_EDIT",
    "PRODUCT_DELETE",
  ],

  Stores: [
    "STORE_VIEW",
    "STORE_ADD_EDIT",
    "STORE_DELETE",
  ],

  USERS: [
    "USER_VIEW",
    "USER_ADD_EDIT",
    "USER_DELETE",
  ],

  Drivers: [
    "DRIVER_VIEW",
    "DRIVER_ADD_EDIT",
    "DRIVER_DELETE",
  ],

  Expenses: [
    "EXPENSE_VIEW",
    "EXPENSE_ADD_EDIT",
    "EXPENSE_DELETE",
  ],

  Reports: [
    "REPORT_VIEW",
  ],

  Banners: [
    "BANNER_VIEW",
    "BANNER_ADD_EDIT",
    "BANNER_DELETE",
  ],

  Categories: [
    "CATEGORY_VIEW",
    "CATEGORY_ADD_EDIT",
    "CATEGORY_DELETE",
  ],
};

export default PERMISSION_LIST;
