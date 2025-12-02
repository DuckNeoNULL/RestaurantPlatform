import React from "react";
import { CPagination, CPaginationItem } from "@coreui/react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // không cần hiện nếu chỉ có 1 trang

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <CPaginationItem
        key={i}
        active={i === currentPage}
        onClick={() => onPageChange(i)}
        style={{ cursor: "pointer" }}
      >
        {i}
      </CPaginationItem>
    );
  }

  return (
    <CPagination aria-label="Page navigation">
      {/* Previous */}
      <CPaginationItem
        aria-label="Previous"
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        style={{ cursor: currentPage === 1 ? "default" : "pointer" }}
      >
        <span aria-hidden="true">&laquo;</span>
      </CPaginationItem>

      {/* Danh sách trang */}
      {pages}

      {/* Next */}
      <CPaginationItem
        aria-label="Next"
        disabled={currentPage === totalPages}
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        style={{ cursor: currentPage === totalPages ? "default" : "pointer" }}
      >
        <span aria-hidden="true">&raquo;</span>
      </CPaginationItem>
    </CPagination>
  );
};

export default Pagination;