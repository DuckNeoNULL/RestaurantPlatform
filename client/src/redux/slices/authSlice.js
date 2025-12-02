import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "../../services/authService";

/* ------------------------- ASYNC THUNKS ------------------------- */

// Đăng nhập
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

// Lấy user hiện tại
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

// Đăng xuất
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

// Đăng ký Customer
export const signUpCustomer = createAsyncThunk(
  "auth/signUpCustomer",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.signUpCustomer(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

// Đăng ký Partner
export const signUpPartner = createAsyncThunk(
  "auth/signUpPartner",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.signUpPartner(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

// Quên mật khẩu
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const data = await authService.forgotPassword(email);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

// Đặt lại mật khẩu
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.resetPassword(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  }
);

/* ------------------------- INITIAL STATE ------------------------- */

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  status: "idle", // idle | loading | succeeded | failed
  successMessage: null,
};

/* ------------------------- SLICE ------------------------- */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- LOGIN ---------- */
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload || {};
        const user = payload.user ?? payload;
        state.user = user;
        state.status = "succeeded";
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload || action.error.message;
        state.status = "failed";
      })

      /* ---------- FETCH CURRENT USER ---------- */
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload || {};
        state.user = payload.user ?? payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload || action.error.message;
      })

      /* ---------- LOGOUT ---------- */
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      /* ---------- SIGNUP CUSTOMER ---------- */
      .addCase(signUpCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Đăng ký tài khoản khách hàng thành công!";
        if (action.payload?.user) state.user = action.payload.user;
      })
      .addCase(signUpCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      /* ---------- SIGNUP PARTNER ---------- */
      .addCase(signUpPartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpPartner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Đăng ký Partner thành công! Hãy chờ admin xác minh.";
      })
      .addCase(signUpPartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      /* ---------- FORGOT PASSWORD ---------- */
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      /* ---------- RESET PASSWORD ---------- */
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || "Đặt lại mật khẩu thành công!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});



/* ------------------------- EXPORT ------------------------- */

export const { setUser, clearError, clearSuccess } = authSlice.actions;
export default authSlice.reducer;