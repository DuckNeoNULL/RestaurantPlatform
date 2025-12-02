import React from "react";

export function Button({ children, onClick, className = "", variant = "default", size = "md" }) {
  const base =
    "rounded-lg px-4 py-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
