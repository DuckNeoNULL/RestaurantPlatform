const API_BASE = "/api/payouts";

/**
 * Fetch payouts of the current partner (aggregated across their restaurants)
 * Backend: GET /api/payouts/partner/:partnerID
 * Returns: { success, data: Payout[] }
 */
export async function getPayoutsByPartner(partnerID) {
  if (!partnerID) throw new Error("partnerID is required");
  const res = await fetch(`${API_BASE}/partner/${partnerID}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Get partner payouts failed");
  }
  return json?.data ?? [];
}
