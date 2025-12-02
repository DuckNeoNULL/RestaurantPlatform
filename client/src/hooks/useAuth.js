import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login as loginThunk,
  logout as logoutThunk,
  fetchCurrentUser,
  signUpCustomer as signUpCustomerThunk,
  signUpPartner as signUpPartnerThunk,
  forgotPassword as forgotPasswordThunk,
  resetPassword as resetPasswordThunk,
  setUser,
  clearError,
  clearSuccess,
} from "../redux/slices/authSlice";
import { loginWithGooglePopup } from "../firebase/firebase";

/**
 * ✅ useAuth hook (Redux backed)
 * - Lưu token vào localStorage
 * - Tự động lấy lại user khi reload (nếu có token)
 * - Xử lý đăng nhập Google + đăng nhập truyền thống
 */
// Module-level flag to avoid multiple redundant hydrations in dev (StrictMode double mount)

export default function useAuth() {
  const dispatch = useDispatch();
  const { user, isLoading, error, successMessage } = useSelector(
    (state) => state.auth || {}
  );

  const isAuthenticated = !!user;

  // ======================================================
  // 1️⃣ Tự động refresh user khi app load lại
  // ======================================================
  useEffect(() => {
    // Prevent duplicate hydrations (first mount only)
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUserFromToken(token);
    } else {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  const fetchCurrentUserFromToken = async (token) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(setUser(data.user));
      } else {
        localStorage.removeItem("token");
        dispatch(setUser(null));
      }
    } catch (err) {
      localStorage.removeItem("token");
      dispatch(setUser(null));
    }
  };

  // ======================================================
  // 2️⃣ Đăng nhập truyền thống
  // ======================================================
  const login = useCallback(
    async (credentials) => {
      const action = await dispatch(loginThunk(credentials));
      if (loginThunk.rejected.match(action))
        throw action.payload || action.error.message;

      // ✅ Lưu token nếu backend trả về
      if (action.payload?.token) {
        localStorage.setItem("token", action.payload.token);
      }

      return action.payload;
    },
    [dispatch]
  );

  // ======================================================
  // 3️⃣ Đăng xuất
  // ======================================================
  const logout = useCallback(async () => {
    const action = await dispatch(logoutThunk());
    if (logoutThunk.rejected.match(action))
      throw action.payload || action.error.message;
    dispatch(setUser(null)); // đảm bảo xóa user local
    // Reload page to fully reset client state and pick up cleared HttpOnly cookie
    // You can change to: window.location.assign('/') if you prefer redirect to home
    window.location.reload();
  }, [dispatch]);

  // ======================================================
  // 4️⃣ Refresh user (bằng redux thunk fetchCurrentUser)
  // ======================================================
  const refreshUser = useCallback(async () => {
    const action = await dispatch(fetchCurrentUser());
    if (fetchCurrentUser.rejected.match(action)) {
      dispatch(setUser(null));
      throw action.payload || action.error.message;
    }
    return action.payload;
  }, [dispatch]);

  // ======================================================
  // 5️⃣ Đăng ký Customer
  // ======================================================
  const signUpCustomer = useCallback(
    async (payload) => {
      const action = await dispatch(signUpCustomerThunk(payload));
      if (signUpCustomerThunk.rejected.match(action))
        throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  // ======================================================
  // 6️⃣ Đăng ký Partner
  // ======================================================
  const signUpPartner = useCallback(
    async (payload) => {
      const action = await dispatch(signUpPartnerThunk(payload));
      if (signUpPartnerThunk.rejected.match(action))
        throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  // ======================================================
  // 7️⃣ Quên mật khẩu
  // ======================================================
  const forgotPassword = useCallback(
    async (email) => {
      const action = await dispatch(forgotPasswordThunk(email));
      if (forgotPasswordThunk.rejected.match(action))
        throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  // ======================================================
  // 8️⃣ Đặt lại mật khẩu
  // ======================================================
  const resetPassword = useCallback(
    async (payload) => {
      const action = await dispatch(resetPasswordThunk(payload));
      if (resetPasswordThunk.rejected.match(action))
        throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  // ======================================================
  // 9️⃣ Login bằng Google (Firebase popup)
  // ======================================================
  const loginWithGoogle = async () => {
    try {
      // 1. Mở popup đăng nhập Google qua Firebase
      const result = await loginWithGooglePopup();
      const firebaseUser = result.user;

      // 2. Lấy Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // 3. Gửi token lên backend để xác thực
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      // ✅ 4. Lưu JWT vào localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // ✅ 5. Lưu user vào Redux
      dispatch(setUser(data.user));

      return data.user;
    } catch (err) {
      throw err;
    }
  };

  // ======================================================
  // 🔹 Xóa lỗi / thông báo
  // ======================================================
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);
  const clearAuthSuccess = useCallback(
    () => dispatch(clearSuccess()),
    [dispatch]
  );

  // ======================================================
  // ✅ Trả ra các giá trị và hàm helper
  // ======================================================
  return {
    user,
    isLoading,
    error,
    successMessage,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    signUpCustomer,
    signUpPartner,
    forgotPassword,
    resetPassword,
    clearAuthError,
    clearAuthSuccess,
    loginWithGoogle,
  };
}