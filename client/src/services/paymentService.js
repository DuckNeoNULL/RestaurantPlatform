const API_BASE = "/api/payments";

/**
 * Create a PayOS checkout link for a booking's deposit
 * Backend: POST /api/bookings/:bookingID/payment/payos
 * Body: { name, email, phone }
 * Returns: { success, bookingID, orderCode, amount, checkoutUrl }
 */
export async function createPayOSCheckout(bookingID, buyer = {}) {
  if (!bookingID) throw new Error("bookingID is required");
  const res = await fetch(`${API_BASE}/payos/checkout/${bookingID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: buyer?.name,
      email: buyer?.email,
      phone: buyer?.phone,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Create PayOS checkout failed");
  }
  return json;
}

/**
 * Query PayOS payment status by orderCode
 * Backend: GET /api/bookings/payment/payos/status/:orderCode
 * Returns: { success, bookingID, orderCode, status, amount, raw }
 */
export async function getPayOSStatus(orderCode) {
  if (!orderCode) throw new Error("orderCode is required");
  const res = await fetch(`${API_BASE}/payos/status/${orderCode}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Get PayOS status failed");
  }
  return json;
}

/**
 * Fetch all payments across restaurants owned by a partner
 * Backend: GET /api/payments/partner/:partnerID
 * Returns: { success, data: Payment[] }
 */
export async function getPaymentsByPartner(partnerID) {
  if (!partnerID) throw new Error("partnerID is required");
  const res = await fetch(`${API_BASE}/partner/${partnerID}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Get partner payments failed");
  }
  return json?.data ?? [];
}
