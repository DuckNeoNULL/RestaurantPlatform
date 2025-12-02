import axios from "axios";

// Sử dụng proxy từ package.json (http://localhost:5000)
const API = "/api/amenities";

export const getAmenities = async () => {
  const res = await axios.get(API);
  return res.data;
};
