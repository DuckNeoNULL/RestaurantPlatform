import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as paymentService from "../../services/paymentService";

// Thunk: create PayOS checkout link
export const createPayOSCheckout = createAsyncThunk(
  "payment/createPayOSCheckout",
  async ({ bookingID, buyer }, { rejectWithValue }) => {
    try {
      const res = await paymentService.createPayOSCheckout(bookingID, buyer);
      return res; // { success, bookingID, orderCode, amount, checkoutUrl }
    } catch (err) {
      return rejectWithValue(err?.message || String(err));
    }
  }
);

// Thunk: poll/check PayOS status by orderCode
export const fetchPayOSStatus = createAsyncThunk(
  "payment/fetchPayOSStatus",
  async (orderCode, { rejectWithValue }) => {
    try {
      const res = await paymentService.getPayOSStatus(orderCode);
      return res; // { success, bookingID, orderCode, status, amount, raw }
    } catch (err) {
      return rejectWithValue(err?.message || String(err));
    }
  }
);

const initialState = {
  checkout: null, // { bookingID, orderCode, amount, checkoutUrl }
  checkoutStatus: "idle",
  checkoutError: null,

  statusInfo: null, // { bookingID, orderCode, status, amount, raw }
  statusStatus: "idle",
  statusError: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearCheckout(state) {
      state.checkout = null;
      state.checkoutStatus = "idle";
      state.checkoutError = null;
    },
    clearStatusInfo(state) {
      state.statusInfo = null;
      state.statusStatus = "idle";
      state.statusError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // create checkout
      .addCase(createPayOSCheckout.pending, (state) => {
        state.checkoutStatus = "loading";
        state.checkoutError = null;
      })
      .addCase(createPayOSCheckout.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        const { bookingID, orderCode, amount, checkoutUrl } = action.payload || {};
        state.checkout = { bookingID, orderCode, amount, checkoutUrl };
      })
      .addCase(createPayOSCheckout.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.checkoutError = action.payload ?? action.error?.message;
      })
      // fetch status
      .addCase(fetchPayOSStatus.pending, (state) => {
        state.statusStatus = "loading";
        state.statusError = null;
      })
      .addCase(fetchPayOSStatus.fulfilled, (state, action) => {
        state.statusStatus = "succeeded";
        const { bookingID, orderCode, status, amount, raw } = action.payload || {};
        state.statusInfo = { bookingID, orderCode, status, amount, raw };
      })
      .addCase(fetchPayOSStatus.rejected, (state, action) => {
        state.statusStatus = "failed";
        state.statusError = action.payload ?? action.error?.message;
      });
  },
});

export const { clearCheckout, clearStatusInfo } = paymentSlice.actions;

export const selectPayment = (state) => state.payment ?? initialState;

export default paymentSlice.reducer;
