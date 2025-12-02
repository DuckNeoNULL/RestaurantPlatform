import React from "react";

export function Select({ value, onChange, options = [], className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
