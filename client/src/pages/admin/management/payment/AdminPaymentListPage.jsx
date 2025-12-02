import React, { useState, useEffect } from "react";
import axios from "../../../../api/axios";
import {
  Table,
  Badge,
  Button,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";

export default function AdminPaymentListPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const STATUS = {
    0: { label: "Chờ xử lý", color: "warning" },
    1: { label: "Đã thanh toán", color: "success" },
    2: { label: "Thất bại", color: "danger" },
    3: { label: "Hoàn tiền", color: "secondary" },
  };

  const TYPE = {
    0: "Tiền cọc (30%)",
    1: "Thanh toán còn lại (70%)",
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/admin/payments");
      setPayments(res.data.data);
    } catch (err) {
      console.error("Load payments failed", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const name =
      p.booking?.customer?.user?.fullName?.toLowerCase() || "";
    const restaurant =
      p.booking?.hall?.restaurant?.name?.toLowerCase() || "";

    const matchSearch =
      name.includes(search.toLowerCase()) ||
      restaurant.includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all" ||
      p.status?.toString() === filterStatus;

    return matchSearch && matchStatus;
  });

  const formatCurrency = (v) => v.toLocaleString("vi-VN") + " ₫";

  return (
    <AdminLayout title="Quản lý thanh toán">
      <div className="container py-4">

        {/* SEARCH & FILTER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0">Danh sách thanh toán</h2>

          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" size="sm">
                {filterStatus === "all"
                  ? "Tất cả trạng thái"
                  : STATUS[filterStatus]?.label}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterStatus("all")}>
                  Tất cả
                </Dropdown.Item>
                {Object.keys(STATUS).map((key) => (
                  <Dropdown.Item key={key} onClick={() => setFilterStatus(key)}>
                    {STATUS[key].label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <InputGroup size="sm" style={{ width: "260px" }}>
              <FormControl
                placeholder="Tìm khách hàng / nhà hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline-primary">
                <i className="fas fa-search"></i>
              </Button>
            </InputGroup>
          </div>
        </div>

        {/* LIST */}
        <div className="table-responsive shadow-sm rounded-4">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light text-muted">
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Nhà hàng</th>
                <th>Loại</th>
                <th>Ngày thanh toán</th>
                <th className="text-end">Số tiền</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.paymentID}>
                  <td>{i + 1}</td>
                  <td>{p.booking.customer.user.fullName}</td>
                  <td>{p.booking.hall.restaurant.name}</td>
                  <td>{TYPE[p.type]}</td>
                  <td>{new Date(p.paymentDate).toLocaleString("vi-VN")}</td>
                  <td className="text-end fw-semibold">{formatCurrency(p.amount)}</td>
                  <td className="text-center">
                    <Badge bg={STATUS[p.status].color}>{STATUS[p.status].label}</Badge>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() =>
                        navigate(`/admin/payments/${p.paymentID}`)
                      }
                    >
                      Xem
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
