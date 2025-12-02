// ...existing code...
const API_URL = "/api/bookings";

/**
 * Gọi backend để tạo booking
 * payload: { customer, bookingInfo, menu, services, promotion, priceSummary }
 */
export async function createBooking(payload) {
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data || new Error("Create booking failed");
  return data;
}

/**
 * Create a manual/external booking (partner only). Calls backend POST /api/bookings/manual
 * payload: { hallID, eventDate, startTime, endTime, tableCount, menuID?, eventTypeID?, specialRequest? }
 */
export async function createManualBooking(payload) {
  const res = await fetch(`${API_URL}/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data || new Error("Create manual booking failed");
  return data;
}

/**
 * Lấy danh sách promotion từ backend (có thể filter ở backend)
 * query params optional: eventType, date, tables, restaurantId
 */
export async function getPromotions(params = {}) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qp.set(k, String(v));
  });
  const res = await fetch(`/api/promotions?${qp.toString()}`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw data || new Error("Fetch promotions failed");
  return Array.isArray(data) ? data : data?.promotions ?? [];
}

/**
 * Helper local price calculation (can be moved server-side)
 * menu: { name, price } price per guest
 * tables: number (guests = tables * avgGuestsPerTable)
 * services: [{ id, name, price }] (fixed price)
 * promotion: { id, type, value } type: percent | fixed
 */
export function calculatePrice({ menu, tables = 1, services = [], promotion = null, hallFee = 0, avgGuestsPerTable = 1 }) {
  const menuPrice = Number(menu?.price || 0);
  const tablesNum = Number(tables || 1);
  const hallFeeNum = Number(hallFee || 0);
  const guests = tablesNum * Number(avgGuestsPerTable || 1);
  const menuTotal = menuPrice * tablesNum;
  const servicesTotal = (services || []).reduce((s, it) => s + Number(it.price || 0), 0);
  const subtotal = menuTotal  + hallFeeNum;
  let discount = 0;
  if (promotion) {
    const promoValue = Number(promotion?.discountValue || 0);
      discount = Math.round((subtotal * promoValue) / 100);
  }
  const subtotalAfterDiscount = subtotal - discount + servicesTotal;
  const vat = Math.round((subtotalAfterDiscount) * 0.08); // 8% VAT
  const total = subtotalAfterDiscount + vat;
  return {
    guests,
    menuTotal,
    servicesTotal,
    subtotal,
    discount,
    vat,
    total
  };
}

/**
 * Lấy danh sách booking của chính khách hàng đang đăng nhập
 * Backend: GET /api/bookings/me (trả { success, data })
 */
export async function getMyBookings(params = {}) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qp.set(k, String(v));
  });
  const url = qp.toString() ? `${API_URL}/me?${qp.toString()}` : `${API_URL}/me`;
  const res = await fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Fetch my bookings failed');
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Customer cancels a booking
 * Backend: PATCH /api/bookings/:id/customer/cancel
 */
export async function customerCancel(bookingID, reason = "") {
  const res = await fetch(`${API_URL}/${bookingID}/customer/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    credentials: 'include',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Cancel booking failed');
  return json; // { success, message, data: { success, previous, status } }
}

/**
 * Customer confirms a booking (after partner accepted)
 * Backend: PATCH /api/bookings/:id/customer/confirm
 */
export async function customerConfirm(bookingID) {
  const res = await fetch(`${API_URL}/${bookingID}/customer/confirm`, {
    method: 'PATCH',
    credentials: 'include',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Confirm booking failed');
  return json;
}

/**
 * Partner accepts a booking
 * Backend: PATCH /api/bookings/:id/partner/accept
 */
export async function partnerAccept(bookingID) {
  const res = await fetch(`${API_URL}/${bookingID}/partner/accept`, {
    method: 'PATCH',
    credentials: 'include',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Partner accept failed');
  return json;
}

/**
 * Partner rejects a booking
 * Backend: PATCH /api/bookings/:id/partner/reject
 */
export async function partnerReject(bookingID, reason = '') {
  const res = await fetch(`${API_URL}/${bookingID}/partner/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    credentials: 'include',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Partner reject failed');
  return json;
}

/**
 * Lấy tất cả booking thuộc partner đăng nhập
 * Backend: GET /api/bookings/partner/me (trả { success, data })
 */
export async function getPartnerBookings({ detailed = true } = {}) {
  const qp = detailed ? '?include=details' : '';
  const res = await fetch(`${API_URL}/partner/me${qp}`, { credentials: 'include', headers: { Accept: 'application/json' } });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Fetch partner bookings failed');
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Lấy tất cả booking (tạm thời dùng cho partner, sẽ thay bằng endpoint dành riêng khi có)
 * Backend: GET /api/bookings (trả { success, data })
 */
export async function getAllBookings() {
  const res = await fetch(`${API_URL}`, { credentials: 'include', headers: { Accept: 'application/json' } });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Fetch bookings failed');
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Update a booking by ID
 * Backend: PATCH /api/bookings/:id
 */
export async function updateBooking(bookingID, updates) {
  const res = await fetch(`${API_URL}/${bookingID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Update booking failed');
  return json;
}

/**
 * Lấy chi tiết booking theo ID
 * Backend: GET /api/bookings/:id (trả { success, data })
 */
export async function getBookingById(bookingID) {
  const res = await fetch(`${API_URL}/${bookingID}`, { credentials: 'include', headers: { Accept: 'application/json' } });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Fetch booking detail failed');
  return json?.data ?? json;
}