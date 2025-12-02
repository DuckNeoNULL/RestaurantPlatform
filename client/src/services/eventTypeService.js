import api from "../api/axios";

// Backend mounts event type routes at /api/eventtypes
export const getEventTypes = async () => {
  const res = await api.get("/eventtypes");
  // support either array or wrapped response
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
};