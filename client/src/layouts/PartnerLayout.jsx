import React from "react";
import { Container } from "react-bootstrap";
import Sidebar from "../components/PartnerSideBar";
import TopBar from "../components/PartnerTopBar";
import {Outlet} from "react-router-dom";

export default function PartnerLayout({ children }) {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex-fill">
        <TopBar />
        <Container className="p-4">
          {children}
        </Container>
      </div>
    </div>
  );
}
