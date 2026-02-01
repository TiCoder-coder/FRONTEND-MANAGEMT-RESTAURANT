export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: "/restaurants/v1/client/auth/login",
  AUTH_LOGOUT: "/restaurants/v1/client/auth/logout",
  AUTH_PROFILE: "/restaurants/v1/client/auth/profile",
  AUTH_REGISTER: "/restaurants/v1/client/auth/register",
  AUTH_RESET_PASSWORD: "/restaurants/v1/client/auth/reset-password",
  AUTH_CHANGE_PASSWORD: "/restaurants/v1/client/auth/change-password",
  AUTH_OTP: "/restaurants/v1/client/auth/otp",
  AUTH_UPDATE_PROFILE: "/restaurants/v1/client/auth/update-profile",
  AUTH_REFRESH_TOKEN: "/restaurants/v1/client/auth/refresh-token",

  // Bill
  BILL_CALCULATE: "/restaurants/v1/client/bill/calculate",
  BILLL_ME: "/restaurants/v1/client/bill/me",
  BILL_ID: (id: string) => `/restaurants/v1/client/bill/${id}`,

  //Branch
  BRANCH: "/restaurants/v1/client/branch",
  BRANCH_ID: (id: string) => `/restaurants/v1/client/branch/${id}`,

  // BusinessLicense
  BUSINESSLICENSE: "/restaurants/v1/client/business-license",
  BUSINESSLICENSE_ID: (id: string) =>
    `/restaurants/v1/client/business-license/${id}`,

  // Cart
  CART_ME: "/restaurants/v1/client/cart/me",
  CART_POST: "/restaurants/v1/client/cart",
  CART_DELETE: "/restaurants/v1/client/cart",

  // Category
  CATEGORY: "/restaurants/v1/client/category",
  CATEGORY_TREE: "/restaurants/v1/client/category/tree",
  CATEGORY_ID: (id: string) => `/restaurants/v1/client/category$/${id}`,

  // Company
  COMPANY_ME: "/restaurants/v1/client/company/me",

  // Company profile
  COMPANY_PROFILE_TYPE: (company_id: string, type: string) =>
    `/restaurants/v1/client/company-profile/logo/${type}`,
  COMPANY_PROFILE_ME: (company_id: string) =>
    `/restaurants/v1/client/company-profile/me`,

  // Contact
  CONTACT_POST: "/restaurants/v1/client/contact",
  CONTACT_GET_LIST: "/restaurants/v1/client/contact",
  CONTACT_GET_ID: (id: string) => `/restaurants/v1/client/contact/${id}`,

  // Device Token
  DEVICE_TOKEN_REGISTER: "/restaurants/v1/client/device-token/register",

  // Discount
  DISCOUNT_GET_LIST: "/restaurants/v1/client/discount",
  DISCOUNT_GET_ID: (id: string) => `/restaurants/v1/client/discount/${id}v`,

  // Employee
  EMPLOYEE_GET_LIST: "/restaurants/v1/client/employee",
  EMPLOYEE_GET_ID: (id: string) => `/restaurants/v1/client/employee/${id}`,

  // Google Auth
  GOOGLE_AUTH_LOGIN: "/restaurants/v1/client/google-auth/login",
  GOOGLE_AUTH_REDIRECT: "/restaurants/v1/client/google-auth/redirect",

  // Item
  ITEM_GET_LIST: "/restaurants/v1/client/item",
  ITEM_BEST_SELLER: "/restaurants/v1/client/item/best-seller",
  ITEM_GET_ID: (id: string) => `/restaurants/v1/client/item/${id}`,

  // Member level
  MEMBER_LEVEL_ID_GET_LIST: "/restaurants/v1/client/member-level",
  MEMEBER_LDEVL_ID_GET_ID: (id: string) =>
    `/restaurants/v1/client/member-level/${id}`,

  // News
  NEWS_GET_LIST: "/restaurants/v1/client/news",
  NEWS_GET_ID: (id: string) => `/restaurants/v1/client/news/${id}`,
  NEWS_OUTSTANDING_GET_ID: (company_id: string) =>
    `/restaurants/v1/client/news/outstanding/${company_id}`,

  // Notificatiion
  NOTIFICATION_RECEIVED: "/restaurants/v1/client/notification/received",
  NOTIFICATION_GET_ID: (id: string) =>
    `/restaurants/v1/client/notification/${id} `,
  NOTIFICATION_DELETE_ID: (id: string) =>
    `/restaurants/v1/client/notification/${id} `,
  NOTIFICATION_PATH_ID: (id: string) =>
    `/restaurants/v1/client/notification/${id}`,
  NOTIFICATION_PATCH_READ_ALL: "/restaurants/v1/client/notification/read-all",
  NOTIFICATION_PATCH_ID_RESTORE: (id: string) =>
    `/restaurants/v1/client/notification/${id}/restore`,

  // Order
  ORDER_POST: "/restaurants/v1/client/order",
  ORDER_ME: "/restaurants/v1/client/order/me",
  ORDER_GET_ID: (id: string) => `/restaurants/v1/client/order/${id}`,
  ORDER_GET_ORDER_CODE: (order_code: string) =>
    `/restaurants/v1/client/order/order-code/${order_code}`,

  // Payment
  PAYMENT_MOMO_IPN_POST: "/restaurants/v1/client/payment/momo/ipn",
  PAYMENT_VNPAY_IPN_GET: "/restaurants/v1/client/payment/vnpay/ipn",
  PAYMENT_POST: "/restaurants/v1/client/payment",
  PAYMENT_GET_ID: (id: string) => `/restaurants/v1/client/payment/${id}`,

  // Payment method
  PAYMENT_METHOD_GET_LIST: "/restaurants/v1/client/payment-method",
  PAYMENT_METHOD_GET_ID: (id: string) =>
    `/restaurants/v1/client/payment-method/${id}`,

  // Reservation
  RESERVATION_POST: "/restaurants/v1/client/reservation",
  RESERVATION_GET_ME: "/restaurants/v1/client/reservation/me",
  RESERVATION_GET_ID: (id: string) =>
    `/restaurants/v1/client/reservation/${id}`,

  // Review
  REVIEW_GET_LIST: "/restaurants/v1/client/review",
  REVIEW_POST: "/restaurants/v1/client/review",
  REVIEW_GET_ME: "/restaurants/v1/client/review/me",
  REVIEW_GET_ID: (id: string) => `/restaurants/v1/client/review/${id}`,
  REVIEW_PATCH_ID: (id: string) => `/restaurants/v1/client/review/${id}`,
  REVIEW_DELETE_ID: (id: string) => `/restaurants/v1/client/review/{id}`,
  REVIEW_PATCH_ID_SOFT: (id: string) => `restaurants/v1/client/review/${id}`,
  REVIEW_PATCH_ID_RESTORE: (id: string) =>
    `/restaurants/v1/client/review/${id}/restore`,

  // Settiing point
  SETTING_POINT: (company_id: string) => `/restaurants/v1/client/setting-point`,
  SETTING_POINT_GET_ID: (id: string) =>
    `/restaurants/v1/client/setting-point/{id}`,

  // Site section
  SITE_SECTION_GET_LIST: "/restaurants/v1/client/site-section",
  SITE_SECTION_GET_ID: (id: string) =>
    `/restaurants/v1/client/site-section/{id}`,

  // Slide show
  SLIDESHOW_GET_LIST: "/restaurants/v1/client/slide-shows",
  SLIDESHOW_GET_LOCATION:
    "/restaurants/v1/client/slide-shows/location/{location}",
  SLIDESHOW_GET_ID: (id: string) => `/restaurants/v1/client/slide-shows/{id}`,

  // Table
  TABLE_GET_LIST: "/restaurants/v1/client/table ",
  TABLE_GET_ID: (id: string) => `/restaurants/v1/client/table/{id}`,

  // Upload
  UPLOAD_IMAGES: "/restaurants/v1/client/upload/images",
  UPLOAD_FILES: "/restaurants/v1/client/upload/files",
  UPLOAD_GET_TARGET: "/restaurants/v1/client/upload/target",
  UPLOAD_PATCH_TARGET: "/restaurants/v1/client/upload/target",
  UPLOAD_GET_ID: (id: string) => `/restaurants/v1/client/upload/${id}`,
  UPLOAD_DELETE_ID: "/restaurants/v1/client/upload/delete",

  // WorkExperience
  WORKEXPERIENCE_USERID: (userId: string) =>
    `/restaurants/v1/client/work-experience/userId`,
  WORKEXPERIENCE_ID: (id: string) =>
    `/restaurants/v1/client/work-experience/${id}`,

  // Working time
  WORKINGTIME_GET_LIST: "/restaurants/v1/client/working-time",
  WORKINGTIME_GET_ID: (id: string) =>
    `/restaurants/v1/client/working-time/${id}`,

  // Health check
  HEALTH_ROOT: "restaurants/v1",
  HEALTH_SERVICES: "restaurants/v1/health",
};
