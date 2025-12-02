import axios from "axios";

// API backend, ví dụ chạy ở cổng 5000
const API_URL = "http://localhost:5000/api/auth/";

// Gom các hàm thành object
const authService = {
  register: async (data) => {
    try {
      const response = await axios.post(API_URL + "signup", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
