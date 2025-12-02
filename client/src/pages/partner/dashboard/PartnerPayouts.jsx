import { useEffect, useMemo, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { getPayoutsByPartner } from "../../../services/payoutService";

function formatCurrency(v) {
  if (v == null) return "-";
  return Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("vi-VN");
  } catch {
    return String(v);
  }
}

const METHOD_LABEL = {
  0: "PayOS",
  1: "Chuyển khoản",
  2: "Thẻ",
  3: "Tiền mặt",
};

const STATUS_LABEL = {
  0: "PENDING",
  1: "PROCESSING",
  2: "COMPLETED",
  3: "FAILED",
  4: "CANCELLED",
};

export default function PartnerPayouts() {
  const { user, isLoading: authLoading } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const partnerID = useMemo(() => {
    const u = user || {};
    return (
      u?.partner?.restaurantPartnerID ||
      u?.restaurantPartnerID ||
      (u?.role === 1 ? u?.userID : null)
    );
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!partnerID) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPayoutsByPartner(partnerID);
        if (!ignore) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setError(err?.message || String(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => (ignore = true);
  }, [partnerID]);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return rows;
    const s = Number(statusFilter);
    return rows.filter((r) => Number(r.status) === s);
  }, [rows, statusFilter]);

  const totals = useMemo(() => {
    const base = { gross: 0, commission: 0, payout: 0 };
    return filtered.reduce((acc, r) => {
      acc.gross += Number(r.grossAmount || 0);
      acc.commission += Number(r.commissionAmount || 0);
      acc.payout += Number(r.payoutAmount || 0);
      return acc;
    }, base);
  }, [filtered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <SummaryCard title="Tổng Gross" value={formatCurrency(totals.gross)} />
        <SummaryCard title="Tổng Hoa Hồng" value={formatCurrency(totals.commission)} />
        <SummaryCard title="Tổng Chi Trả" value={formatCurrency(totals.payout)} />
        <div style={{ marginLeft: "auto" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value={0}>PENDING</option>
            <option value={1}>PROCESSING</option>
            <option value={2}>COMPLETED</option>
            <option value={3}>FAILED</option>
            <option value={4}>CANCELLED</option>
          </select>
        </div>
      </div>

      {loading || authLoading ? (
        <div>Đang tải dữ liệu chi trả…</div>
      ) : error ? (
        <div style={{ color: "#dc2626" }}>Lỗi: {error}</div>
      ) : (
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <Th>ID</Th>
                <Th>Payment</Th>
                <Th>Gross</Th>
                <Th>Hoa Hồng</Th>
                <Th>Chi Trả</Th>
                <Th>Phương Thức</Th>
                <Th>Trạng Thái</Th>
                <Th>Ref</Th>
                <Th>Released By</Th>
                <Th>Released At</Th>
                <Th>Tạo Lúc</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: 16, color: "#6b7280" }}>
                    Chưa có bản ghi chi trả
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.payoutId} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <Td>{r.payoutId}</Td>
                    <Td>#{r.paymentId}</Td>
                    <Td>{formatCurrency(r.grossAmount)}</Td>
                    <Td>{formatCurrency(r.commissionAmount)}</Td>
                    <Td>{formatCurrency(r.payoutAmount)}</Td>
                    <Td>{METHOD_LABEL[r.method] ?? r.method}</Td>
                    <Td>{STATUS_LABEL[r.status] ?? r.status}</Td>
                    <Td style={{ fontFamily: "monospace" }}>{r.transactionRef || "-"}</Td>
                    <Td>{r.releasedBy ?? "-"}</Td>
                    <Td>{formatDate(r.releasedAt)}</Td>
                    <Td>{formatDate(r.createdAt)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        minWidth: 220,
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "#64748b", fontWeight: 700 }}>
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td style={{ padding: 12, fontSize: 14, color: "#334155" }}>{children}</td>;
}
