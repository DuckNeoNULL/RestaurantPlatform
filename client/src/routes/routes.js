import React from "react";
const Dashboard = React.lazy(() =>
  import("../pages/admin/dashboard/Dashboard")
);

const WidgetsDropdown = React.lazy(() =>
  import("../pages/admin/widgets/WidgetsDropdown")
);

const WidgetsBrand = React.lazy(() =>
  import("../pages/admin/widgets/WidgetsBrand")
);



// Management
const Users = React.lazy(() => import("../pages/admin/management/users/UserList"));
const PartnerLicense = React.lazy(() => import("../pages/admin/license/LicenseCommissionPage"));



// Restaurants
const RestaurantList = React.lazy(() => import("../pages/admin/restaurants/RestaurantListPage"));
const EventTypes = React.lazy(() => import("../pages/admin/restaurants/EventTypesPage"));
const Amenities = React.lazy(() => import("../pages/admin/restaurants/AmenitiesPage"));

// Operations
const BookingList = React.lazy(() => import("../pages/admin/operations/bookings/BookingListPage"));
const BookingDetail = React.lazy(() => import("../pages/admin/operations/bookings/BookingDetailPage"));
const PaymentList = React.lazy(() => import("../pages/admin/operations/payments/PaymentListPage"));
const PaymentDetail = React.lazy(() => import("../pages/admin/operations/payments/PaymentDetailPage"));
const Payouts = React.lazy(() => import("../pages/admin/operations/payments/PayoutsPage"));

//Notifications

const Notifications = React.lazy(() => import("../pages/admin/notifications/NotificationsPage")); 

// Reviews
const Reviews = React.lazy(() => import("../pages/admin/feedback/ReviewsReportsPage"));

//Promotions
const PromotionsPage = React.lazy(() => import("../pages/admin/promotions/PromotionsPage"));

// Analytics
const RevenueAnalytics = React.lazy(() => import("../pages/admin/analytics/RevenueStatsPage"));
const BookingAnalytics = React.lazy(() => import("../pages/admin/analytics/BookingStatsPage"));
const PartnerPerformance = React.lazy(() => import("../pages/admin/analytics/PartnerPerformancePage"));
const CustomerInsights = React.lazy(() => import("../pages/admin/analytics/CustomerInsightsPage"));

// System
const NotificationTemplates = React.lazy(() => import("../pages/admin/systems/NotificationTemplatesPage"));
const CMSContent = React.lazy(() => import("../pages/admin/systems/CMSContentPage"));
const Logs = React.lazy(() => import("../pages/admin/systems/LogsAuditTrailPage"));

const routes = [
  { path: "/", exact: true, name: "Home" },
  { path: "/dashboard", name: "Dashboard", element: Dashboard },

  // Management
  { path: "/users", name: "User Management", element: Users },
  { path: "/partner-license", name: "License Verification", element: PartnerLicense },

  // Restaurants
  { path: "/restaurants", name: "Restaurant List", element: RestaurantList },
  { path: "/event-types", name: "Event Types", element: EventTypes },
  { path: "/amenities", name: "Amenities", element: Amenities },

  // Operations
  { path: "/bookings", name: "Bookings", element: BookingList },
  { path: "/bookings/:id", name: "Booking Detail", element: BookingDetail },
  { path: "/payments", name: "Payments", element: PaymentList },
  { path: "/payments/:id", name: "Payment Detail", element: PaymentDetail },
  { path: "/payouts", name: "Payouts", element: Payouts },
  
  //Notifications

  {path: "/notifications", name : "Notification", element: Notifications},

  // Reviews
  { path: "/reviews", name: "Reviews", element: Reviews },

  // Promotions
  { path: "/promotions", name: "Promotions", element: PromotionsPage },

  // Analytics
  { path: "/analytics/revenue", name: "Revenue Analytics", element: RevenueAnalytics },
  { path: "/analytics/bookings", name: "Booking Analytics", element: BookingAnalytics },
  { path: "/analytics/partners", name: "Partner Performance", element: PartnerPerformance },
  { path: "/analytics/customers", name: "Customer Insights", element: CustomerInsights },

  // System
  { path: "system/notifications", name: "Notification Templates", element: NotificationTemplates },
  { path: "system/cms", name: "CMS Content", element: CMSContent },
  { path: "system/logs", name: "System Logs", element: Logs },

  //Widgets

  { path: "/widgets/dropdown", name: "WidgetsDropdown", element: WidgetsDropdown },
  { path: "/widgets/brand", name: "WidgetsBrand", element: WidgetsBrand },
];

export default routes;