import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react"; // Lucide icons



const ServiceList = ({ restaurant }) => {
  const eventTypeNames = {
    1: "Tiệc cưới",
    ...restaurant.eventTypes?.reduce((acc, type) => {
      acc[type.eventTypeID] = type.name;
      return acc;
    }, {}),
  };
  const activeServices = restaurant.services?.filter(service => service.status == 1) || [];
  const groupedServices = activeServices.reduce((acc, service) => {
    if (!acc[service.eventTypeID]) acc[service.eventTypeID] = [];
    acc[service.eventTypeID].push(service);
    return acc;
  }, {}) || {};

  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (eventTypeID) => {
    setOpenGroups((prev) => ({
      ...prev,
      [eventTypeID]: !prev[eventTypeID],
    }));
  };

  return (
    <div>
      <h4
        className="section-title mb-3"
        style={{ color: "#e11d48", fontWeight: "bold", fontSize: "1.6rem" }}
      >
        Dịch vụ
      </h4>

      {Object.entries(groupedServices).map(([eventTypeID, services]) => (
        <div key={eventTypeID} className="mb-3">
          {/* Header Accordion */}
          <button
            className="w-100 d-flex justify-content-between align-items-center"
            onClick={() => toggleGroup(eventTypeID)}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              backgroundColor: "#f8eef2",
              color: "#e11d48",
              fontWeight: "bold",
              fontSize: "1rem",
              boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3dce1")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f8eef2")}
          >
            <span>
              {eventTypeNames[eventTypeID] || `EventType ${eventTypeID}`} ({services.length})
            </span>
            {openGroups[eventTypeID] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* Content Accordion */}
          {openGroups[eventTypeID] && (
            <div
              className="mt-2 p-3"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                borderRadius: "10px",
                boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                backgroundColor: "#fff",
              }}
            >
              {services.map((service, idx) => (
                <div
                  key={service.serviceID}
                  className="d-flex justify-content-between align-items-center mb-2 p-3"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #f0c6d1",
                    background: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.03)";
                  }}
                >
                  <span style={{ color: "#e11d48", fontWeight: "500" }}>
                    {idx + 1}. {service.name}
                  </span>
                  <span style={{ fontWeight: "bold", color: "#e11d48" }}>
                    {parseFloat(service.price).toLocaleString()} VND / {service.unit ?? "-"}
                  </span>
                </div>
              ))}
              {services.length === 0 && (
                <div className="text-center text-muted">Không có dịch vụ nào</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServiceList;