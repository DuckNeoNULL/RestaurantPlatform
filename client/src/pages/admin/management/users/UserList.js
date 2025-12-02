import React, { useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CButton,
  CBadge,
  CPagination,
  CPaginationItem,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasBody,
} from "@coreui/react";
import Swal from "sweetalert2";
import UserDetail from "./UserDetails";

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleDetail, setVisibleDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const pageSize = 5;

  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleActive = (id) => {
    const user = users.find((u) => u.id === id);
    Swal.fire({
      title: user.active ? "Deactivate this user?" : "Activate this user?",
      text: `Are you sure you want to ${
        user.active ? "deactivate" : "activate"
      } ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
        );
        Swal.fire("Updated!", "User status has been updated.", "success");
      }
    });
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setVisibleDetail(true);
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>User Management</strong>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-between mb-3">
            <CFormInput
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ maxWidth: "300px" }}
            />
            <CButton color="primary" onClick={() => alert("Create new user")}>
              + Add User
            </CButton>
          </div>

          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {displayedUsers.map((u, index) => (
                <CTableRow key={u.id}>
                  <CTableHeaderCell>
                    {(currentPage - 1) * pageSize + index + 1}
                  </CTableHeaderCell>
                  <CTableDataCell>{u.name}</CTableDataCell>
                  <CTableDataCell>{u.role}</CTableDataCell>
                  <CTableDataCell>{u.createdAt}</CTableDataCell>
                  <CTableDataCell>
                    {u.active ? (
                      <CBadge color="success">Active</CBadge>
                    ) : (
                      <CBadge color="secondary">Inactive</CBadge>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      className="me-2"
                      onClick={() => handleViewDetail(u)}
                    >
                      View
                    </CButton>
                    <CButton
                      size="sm"
                      color={u.active ? "danger" : "success"}
                      variant="outline"
                      onClick={() => toggleActive(u.id)}
                    >
                      {u.active ? "Deactivate" : "Activate"}
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {totalPages > 1 && (
            <div className="mt-3 d-flex justify-content-center">
              <CPagination>
                {[...Array(totalPages)].map((_, idx) => (
                  <CPaginationItem
                    key={idx}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                    style={{ cursor: "pointer" }}
                  >
                    {idx + 1}
                  </CPaginationItem>
                ))}
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Popup Offcanvas xem chi tiết */}
      <COffcanvas
        placement="end"
        visible={visibleDetail}
        onHide={() => setVisibleDetail(false)}
        style={{ width: "400px" }}
      >
        <COffcanvasHeader closeButton>
          <strong>User Detail</strong>
        </COffcanvasHeader>
        <COffcanvasBody>
          {selectedUser ? (
            <UserDetail user={selectedUser} />
          ) : (
            <p>No user selected</p>
          )}
        </COffcanvasBody>
      </COffcanvas>
    </>
  );
};


export const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    role: "Customer",
    createdAt: "2025-10-01",
    active: true,
    email: "a@gmail.com",
    phone: "0901234567",
  },
  {
    id: 2,
    name: "Trần Thị B",
    role: "Partner",
    createdAt: "2025-09-15",
    active: false,
    email: "b@gmail.com",
    phone: "0907654321",
    restaurants: [
      {
        name: "Nhà hàng Biển Xanh",
        location: "123 Lê Lợi, Quận 1, TP.HCM",
        status: "Inactive",
      },
      {
        name: "Nhà hàng Hoa Hồng",
        location: "45 Nguyễn Huệ, Quận 1, TP.HCM",
        status: "Active",
      },
    ],
  },
  {
    id: 3,
    name: "Admin C",
    role: "Admin",
    createdAt: "2025-08-20",
    active: true,
    email: "c@gmail.com",
    phone: "0911111111",
  },
  {
    id: 4,
    name: "User D",
    role: "Customer",
    createdAt: "2025-08-10",
    active: false,
    email: "d@gmail.com",
    phone: "0922222222",
  },
  {
    id: 5,
    name: "User E",
    role: "Customer",
    createdAt: "2025-08-09",
    active: true,
    email: "e@gmail.com",
    phone: "0933333333",
  },
  {
    id: 6,
    name: "User F",
    role: "Partner",
    createdAt: "2025-07-25",
    active: true,
    email: "f@gmail.com",
    phone: "0944444444",
    restaurants: [
      {
        name: "The Moonlight Restaurant",
        location: "22 Bà Triệu, Hà Nội",
        status: "Active",
      },
      {
        name: "The Lotus Garden",
        location: "85 Trần Phú, Đà Nẵng",
        status: "Active",
      },
      {
        name: "Saigon Sunset",
        location: "12 Nguyễn Văn Linh, TP.HCM",
        status: "Inactive",
      },
    ],
  },
  {
    id: 7,
    name: "User G",
    role: "Admin",
    createdAt: "2025-07-22",
    active: true,
    email: "g@gmail.com",
    phone: "0955555555",
  },
];


export default UserList;
