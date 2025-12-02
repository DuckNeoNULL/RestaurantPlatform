import api from "../api/axios";

// Backend mounts event type routes at /api/eventtypes
export const getEventTypes = async () => {
  const res = await api.get("/eventtypes");
  // support either array or wrapped response
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];

};

export const getEventTypesByRestaurant = async (restaurantID) => {
  const res = await api.get(`/eventtypes/restaurant/${restaurantID}`);
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
};

export const getAmenities = async () => {
  const res = await api.get("/amenities");
  
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
}