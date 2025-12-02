import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as bookingService from "../../services/bookingService";

export const submitBooking = createAsyncThunk(
  "booking/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await bookingService.createBooking(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

// Partner: load bookings owned by current partner
export const loadPartnerBookings = createAsyncThunk(
  "booking/partner/load",
  async ({ detailed = true } = {}, { rejectWithValue }) => {
    try {
      const data = await bookingService.getPartnerBookings({ detailed });
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

// Partner: accept a booking
export const acceptBookingByPartner = createAsyncThunk(
  "booking/partner/accept",
  async (bookingID, { rejectWithValue }) => {
    try {
      const res = await bookingService.partnerAccept(bookingID);
      return { bookingID, res };
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

// Partner: reject a booking
export const rejectBookingByPartner = createAsyncThunk(
  "booking/partner/reject",
  async ({ bookingID, reason = "Partner rejected" }, { rejectWithValue }) => {
    try {
      const res = await bookingService.partnerReject(bookingID, reason);
      return { bookingID, res };
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

// Update booking by ID
export const updateBooking = createAsyncThunk(
  "booking/update",
  async ({ bookingID, updates }, { rejectWithValue }) => {
    try {
      const res = await bookingService.updateBooking(bookingID, updates);
      return { bookingID, res };
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

// Load full detail by ID for detail page
export const loadBookingDetail = createAsyncThunk(
  "booking/detail/load",
  async (bookingID, { rejectWithValue }) => {
    try {
      const data = await bookingService.getBookingById(bookingID);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

// Simple mock promotions builder for fallback/testing
const buildMockPromotions = (params = {}) => {
  const tables = Number(params?.tables || 0);
  const mocks = [
    { id: "PERC10", title: "Giảm 10% cho tiệc từ 20 bàn", type: "percent", value: 10 },
    { id: "FIX1M", title: "Giảm 1.000.000₫ chi phí dịch vụ", type: "fixed", value: 1000000 },
  ];
  // If tables threshold not met, still return a smaller incentive
  return tables >= 20 ? mocks : [mocks[1]];
};

export const fetchPromotions = createAsyncThunk(
  "booking/fetchPromotions",
  async (params) => {
    try {
      const data = await bookingService.getPromotions(params);
      // If backend returns empty, use mock fallback to keep UX meaningful
      if (!Array.isArray(data) || data.length === 0) return buildMockPromotions(params);
      return data;
    } catch (err) {
      return buildMockPromotions(params);
    }
  }
);

const initialState = {
  customer: { name: "", phone: "", email: "", address: "" },
  bookingInfo: {
    restaurant: "",
    hall: "",
    date: "",
    tables: 1,
    eventType: "Tiệc cưới",
    specialRequest: "",
    dishIDs: [], // normalized list of selected dish IDs
  },
  menu: null, // { id, name, price, categories... }
  services: [], // selected service objects
  dishes: [], // selected dish objects
  promotions: [], // suggestions
  appliedPromotion: null,
  priceSummary: { guests: 0, menuTotal: 0, servicesTotal: 0, subtotal: 0, discount: 0, vat: 0, total: 0 },
  // financial snapshot from server (if any)
  financial: { originalPrice: 0, discountAmount: 0, VAT: 0, totalAmount: 0 },
  status: "idle",
  error: null,
  // Partner view state
  partnerRows: [],
  partnerStatus: "idle",
  partnerError: null,
  // Detail view state
  detail: null,
  detailStatus: "idle",
  detailError: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setCustomerField(state, action) {
      const { key, value } = action.payload;
      state.customer[key] = value;
    },
    setBookingField(state, action) {
      const { key, value } = action.payload;
      state.bookingInfo[key] = value;
    },
    setMenu(state, action) {
      state.menu = action.payload;
    },
    setDishes(state, action) {
      state.dishes = Array.isArray(action.payload) ? action.payload : [];
    },
    toggleService(state, action) {
      const svc = action.payload;
      const exists = state.services.find((s) => s.id === svc.id);
      if (exists) state.services = state.services.filter((s) => s.id !== svc.id);
      else state.services.push(svc);
    },
    setServices(state, action) {
      state.services = Array.isArray(action.payload) ? action.payload : [];
    },
    setPromotions(state, action) {
      state.promotions = action.payload;
    },
    applyPromotion(state, action) {
      state.appliedPromotion = action.payload;
    },
    clearBooking(state) {
      return initialState;
    },
    setPriceSummary(state, action) {
      state.priceSummary = action.payload;
    },
    setFinancial(state, action) {
      const f = action.payload || {};
      state.financial = {
        originalPrice: f.originalPrice ?? 0,
        discountAmount: f.discountAmount ?? 0,
        VAT: f.VAT ?? 0,
        totalAmount: f.totalAmount ?? 0,
      };
    },
    hydrateFromDTO(state, action) {
      // Accept a booking DTO (possibly from server detailed payload)
      const b = action.payload || {};
      // customer
      if (b.customer) {
        const u = b.customer.user || {};
        state.customer = {
          name: b.customer.name ?? u.fullName ?? u.name ?? state.customer.name,
          phone: b.customer.phone ?? u.phone ?? state.customer.phone,
          email: b.customer.email ?? u.email ?? state.customer.email,
          address: b.customer.address ?? u.address ?? state.customer.address,
        };
      }
      // booking info basics
      state.bookingInfo = {
        ...state.bookingInfo,
        restaurant: b.hall?.restaurant?.name ?? state.bookingInfo.restaurant,
        hall: b.hall?.name ?? state.bookingInfo.hall,
        date: b.eventDate ?? state.bookingInfo.date,
        tables: b.tableCount ?? state.bookingInfo.tables,
        eventType: b.eventType?.name ?? state.bookingInfo.eventType,
      };
      // menu
      if (b.menu) state.menu = b.menu;
      // dishes
      if (Array.isArray(b.bookingdishes)) {
        state.dishes = b.bookingdishes.map((bd) => bd.dish).filter(Boolean);
        // derive dishIDs for bookingInfo
        const ids = b.bookingdishes
          .map((bd) => bd.dish?.dishID ?? bd.dishID)
          .filter((id) => Number.isInteger(Number(id)))
          .map(Number);
        state.bookingInfo.dishIDs = ids;
      }
      // services
      if (Array.isArray(b.bookingservices)) {
        state.services = b.bookingservices.map((bs) => ({
          id: bs.service?.serviceID ?? bs.serviceID,
          name: bs.service?.name,
          price: bs.service?.basePrice,
          quantity: bs.quantity ?? 1,
          appliedPrice: bs.appliedPrice,
        })).filter((s) => s.id);
      }
      // financial
      state.financial = {
        originalPrice: b.originalPrice ?? state.financial.originalPrice,
        discountAmount: b.discountAmount ?? state.financial.discountAmount,
        VAT: b.VAT ?? state.financial.VAT,
        totalAmount: b.totalAmount ?? state.financial.totalAmount,
      };
    },
    clearError(state) {
      state.error = null;
    },
    // Partner utilities
    setPartnerRows(state, action) {
      state.partnerRows = Array.isArray(action.payload) ? action.payload : [];
    },
    markCheckedLocal(state, action) {
      const id = action.payload;
      state.partnerRows = (state.partnerRows || []).map((x) =>
        x.bookingID === id ? { ...x, isChecked: 1, checked: 1 } : x
      );
    },
    updateRowLocal(state, action) {
      const { bookingID, patch } = action.payload || {};
      state.partnerRows = (state.partnerRows || []).map((x) =>
        x.bookingID === bookingID ? { ...x, ...patch } : x
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.promotions = action.payload || [];
      })
      .addCase(fetchPromotions.rejected, (state) => {
        // if rejected (should rarely happen due to fallback), keep existing or clear
        state.promotions = state.promotions || [];
      })
      // Partner list
      .addCase(loadPartnerBookings.pending, (state) => {
        state.partnerStatus = "loading";
        state.partnerError = null;
      })
      .addCase(loadPartnerBookings.fulfilled, (state, action) => {
        state.partnerStatus = "succeeded";
        state.partnerRows = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(loadPartnerBookings.rejected, (state, action) => {
        state.partnerStatus = "failed";
        state.partnerError = action.payload ?? action.error?.message;
      })
      // Load detail for page
      .addCase(loadBookingDetail.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(loadBookingDetail.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detail = action.payload || null;
      })
      .addCase(loadBookingDetail.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload ?? action.error?.message;
      })
      // Accept booking
      .addCase(acceptBookingByPartner.fulfilled, (state, action) => {
        const id = action.payload?.bookingID;
        state.partnerRows = (state.partnerRows || []).map((x) =>
          x.bookingID === id ? { ...x, status: 1 } : x
        );
        if (state.detail && state.detail.bookingID === id) {
          state.detail = { ...state.detail, status: 1 };
        }
      })
      // Reject booking
      .addCase(rejectBookingByPartner.fulfilled, (state, action) => {
        const id = action.payload?.bookingID;
        state.partnerRows = (state.partnerRows || []).map((x) =>
          x.bookingID === id ? { ...x, status: 2 } : x
        );
        if (state.detail && state.detail.bookingID === id) {
          state.detail = { ...state.detail, status: 2 };
        }
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        const id = action.payload?.bookingID;
        // Update partnerRows if exists
        state.partnerRows = (state.partnerRows || []).map((x) =>
          x.bookingID === id ? { ...x, ...action.payload.res } : x
        );
        // Update detail if matches
        if (state.detail && state.detail.bookingID === id) {
          state.detail = { ...state.detail, ...action.payload.res };
        }
      });
  },
});

export const {
  setCustomerField,
  setBookingField,
  setMenu,
  setDishes,
  toggleService,
  setServices,
  setPromotions,
  applyPromotion,
  clearBooking,
  setPriceSummary,
  setFinancial,
  hydrateFromDTO,
  clearError,
  setPartnerRows,
  markCheckedLocal,
  updateRowLocal,
} = bookingSlice.actions;

export const selectBooking = (state) => state.booking ?? initialState;
export default bookingSlice.reducer;