import React from "react";
import AdminSideBar from "../components/AdminSideBar";
import AdminTopBar from "../components/AdminTopBar";

export default function AdminLayout({ children }) {
  return (
    <div className="d-flex">
      <AdminSideBar />
      <div className="flex-grow-1">
        <AdminTopBar />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
