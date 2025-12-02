import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as searchService from "../../services/restaurantService";

const initialState = {
  location: "",
  date: "",
  eventType: "Tiệc cưới",
  tables: null, 
  startTime: "10:30",
  endTime: "14:00",
  results: [],
  status: "idle",
  error: null,
};

export const performSearch = createAsyncThunk(
  "search/performSearch",
  async (params, { rejectWithValue }) => {
    try {
      const data = await searchService.searchRestaurants(params);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setField(state, action) {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setFields(state, action) {
      Object.assign(state, action.payload);
    },
    resetSearch() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload || [];
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { setField, setFields, resetSearch } = searchSlice.actions;
export const selectSearch = (state) => state.search || initialState;
export default searchSlice.reducer;