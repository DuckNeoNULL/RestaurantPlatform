import axios from "../api/axios";

const API_URL = "/auth"; // axios baseURL = /api → tổng là /api/auth

/* -------------------- LOGIN -------------------- */
export const login = async ({ email, password, tempToken }) => {
  const body = { email };
  if (tempToken) {
    body.tempToken = tempToken;
  } else {
    body.password = password;
  }
  
  const res = await axios.post(`${API_URL}/login`, body, {
    withCredentials: true,
  });
  
  // Store token in localStorage if returned in response (for OTP login)
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
  
  return res.data;
};

/* -------------------- GET CURRENT USER -------------------- */
export const getCurrentUser = async () => {
  const res = await axios.get(`${API_URL}/me`, {
    withCredentials: true,
  });
  return res.data;
};

/* -------------------- LOGOUT -------------------- */
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });

    // Xóa token local nếu có
    localStorage.removeItem("token");

    return { message: "Đăng xuất thành công" };
  } catch (err) {
    console.warn("[authService] Lỗi logout:", err.message);
    localStorage.removeItem("token");
    return { message: "Đăng xuất (fallback)" };
  }
};

/* -------------------- FORGOT PASSWORD -------------------- */
export const forgotPassword = async (email) => {
  const res = await axios.post(`${API_URL}/forgot-password`, 
    { email },
    { withCredentials: true }
  );
  return res.data;
};

/* -------------------- VERIFY OTP -------------------- */
export const verifyOtp = async ({ email, otp }) => {
  const res = await axios.post(`${API_URL}/verify-otp`, 
    { email, otp },
    { withCredentials: true }
  );
  return res.data;
};

/* -------------------- RESET PASSWORD -------------------- */
export const resetPassword = async ({ email, newPassword, tempToken }) => {
  const res = await axios.post(`${API_URL}/reset-password`, 
    { email, newPassword, tempToken },
    { withCredentials: true }
  );
  return res.data;
};

/* -------------------- SIGNUP OWNER (PARTNER) - UPLOAD FILE -------------------- */
export const signUpPartner = async (formData) => {
  try {
    const res = await axios.post(`${API_URL}/signup/owner`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error("Lỗi đăng ký Partner:", error);
    throw error;
  }
}
/* -------------------- SIGNUP CUSTOMER -------------------- */
export const signUpCustomer = async ({
  fullname,
  weddingRole,
  partner,
  phone,
  email,
  password,
}) => {
  try {
    const res = await axios.post(
      `${API_URL}/signup/customer`,
      {
        fullName: fullname,
        weddingRole,
        partnerName: partner,
        phone,
        email,
        password,
      },
      { withCredentials: true }
    );

    return res.data;
  } catch (error) {
    const result = error.response?.data;
    const status = error.response?.status;

    const err = new Error(result?.error || result?.message || "Đăng ký thất bại");
    err.status = status;
    err.data = result;

    // Nếu backend trả 409 Conflict (email trùng) thì đính kèm thông tin email để frontend hiện lỗi phù hợp
    if (status === 409) {
      err.duplicateField = result?.field || "email";
      err.duplicateValue = result?.value || email;
    }

    throw err;
  }
};

/* -------------------- SAVE PARTNER (Nếu sau này cần dùng) -------------------- */
export async function savePartner({
  name,
  phoneNumber,
  email,
  password,
  licenseUrl,
}) {
  const res = await axios.post(`${API_URL}/signup/owner`, {
    fullName: name,
    phone: phoneNumber,
    email,
    password,
    licenseUrl,
  });

  return res.data;
};
