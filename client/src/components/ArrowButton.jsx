import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ArrowButton({ direction, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "50%",
        padding: "8px 10px",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      {direction === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}
