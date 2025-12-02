import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilSpeedometer,
  cilUser,
  cilBuilding,
  cilTag,
  cilNotes,
  cilDollar,
  cilBarChart,
  cilSettings,
  cilClipboard,
} from "@coreui/icons";
import {CNavGroup, CNavItem, CNavTitle } from "@coreui/react";

const _nav = [
  // ======= DASHBOARD =======
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/admin/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  // ======= USER & PARTNER =======
  {
    component: CNavTitle,
    name: "User / Partner Management",
  },
  {
    component: CNavGroup,
    name: "User & Partner",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: "User List", to: "/admin/users" },
      {
        component: CNavItem,
        name: "License & Commission",
        to: "/admin/partner-license",
      },
    ],
  },

  // ======= RESTAURANTS =======
  {
    component: CNavTitle,
    name: "Restaurant Management",
  },
  {
    component: CNavGroup,
    name: "Restaurants",
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Restaurant List",
        to: "/admin/restaurants",
      },
      { component: CNavItem, name: "Event Types", to: "/admin/event-types" },
      { component: CNavItem, name: "Amenities", to: "/admin/amenities" },
    ],
  },

  // ======= OPERATIONS =======
  {
    component: CNavTitle,
    name: "Booking / Payment Management",
  },
  {
    component: CNavGroup,
    name: "Bookings",
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: "Booking List", to: "/admin/bookings" },
    ],
  },
  {
    component: CNavGroup,
    name: "Payments",
    icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: "Payment List", to: "/admin/payments" },
      { component: CNavItem, name: "Payouts", to: "/admin/payouts" },
    ],
  },

  // ======= REVIEWS =======
  {
    component: CNavTitle,
    name: "Reviews / Reports",
  },
  {
    component: CNavItem,
    name: "Reviews",
    to: "/admin/reviews",
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },

  // ======= PROMOTIONS ======

  {
    component: CNavTitle,
    name: "Promotions",
  },
  {
    component: CNavGroup,
    name: "Promotions Page",
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "All Promotions",
        to: "/admin/promotions",
      },
    ],
  },

  // ======= ANALYTICS =======
  {
    component: CNavTitle,
    name: "Analytics",
  },
  {
    component: CNavGroup,
    name: "Analytics Dashboard",
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
    items: [
      { 
        component: CNavItem, 
        name: "Revenue", 
        to: "/admin/analytics/revenue" 
      },
      {
        component: CNavItem,
        name: "Bookings",
        to: "/admin/analytics/bookings",
      },
      {
        component: CNavItem,
        name: "Partner Performance",
        to: "/admin/analytics/partners",
      },
      {
        component: CNavItem,
        name: "Customer Insights",
        to: "/admin/analytics/customers",
      },
    ],
  },

  // ======= SYSTEM =======
  {
    component: CNavTitle,
    name: "System Settings",
  },
  {
    component: CNavGroup,
    name: "System",
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Notification Templates",
        to: "/admin/system/notifications",
      },
      { component: CNavItem, name: "CMS Content", to: "/admin/system/cms" },
      { component: CNavItem, name: "Logs", to: "/admin/system/logs" },
    ],
  },
];

export default _nav;
