import React from "react";
export default function CapacityRange({ halls }) {
    if (!halls || halls.length === 0) {
        return <p>Chưa có thông tin sức chứa</p>;
    }

    const minCapacity = Math.min(...halls.map(h => h.capacity));
    const maxCapacity = Math.max(...halls.map(h => h.capacity));

    return (
        <span className="d-inline-flex align-items-center">
            {minCapacity} - {maxCapacity} khách
        </span>
    );
}