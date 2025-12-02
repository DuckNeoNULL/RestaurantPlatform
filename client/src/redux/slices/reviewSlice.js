import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as reviewService from "../../services/reviewService";

/* helper */
const getErrorMessage = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error) return err.error;
  return JSON.stringify(err);
};

/* Async thunks */
export const fetchReviewsForRestaurant = createAsyncThunk(
  "reviews/fetchForRestaurant",
  async (restaurantID, { rejectWithValue }) => {
    try {
      const data = await reviewService.getReviewsForRestaurant(restaurantID);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchReviewsForBooking = createAsyncThunk(
  "reviews/fetchForBooking",
  async ({ restaurantID, bookingID }, { rejectWithValue }) => {
    try {
      const data = await reviewService.getReviewsForBooking(restaurantID, bookingID);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/create",
  async ({ restaurantID, reviewData }, { rejectWithValue }) => {
    try {
      const data = await reviewService.createReview(restaurantID, reviewData);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateReview = createAsyncThunk(
  "reviews/update",
  async ({ restaurantID, reviewID, reviewData }, { rejectWithValue }) => {
    try {
      const data = await reviewService.updateReview(restaurantID, reviewID, reviewData);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/delete",
  async ({ restaurantID, reviewID }, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(restaurantID, reviewID);
      return reviewID;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/* Slice */
const initialState = {
  list: [],
  current: null,
  status: "idle",
  error: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsForRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReviewsForRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchReviewsForRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchReviewsForBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReviewsForBooking.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchReviewsForBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createReview.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list.push(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateReview.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.list.findIndex(r => r.reviewID === action.payload.reviewID);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteReview.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = state.list.filter(r => r.reviewID !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrent, clearError } = reviewSlice.actions;

export const selectReviews = (state) => state.reviews?.list ?? [];
export const selectCurrentReview = (state) => state.reviews?.current ?? null;

export default reviewSlice.reducer;