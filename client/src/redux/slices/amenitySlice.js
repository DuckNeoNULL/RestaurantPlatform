import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAmenities } from "../../services/amenityService";

export const fetchAmenities = createAsyncThunk(
  "amenities/fetchAmenities",
  async () => {
    return await getAmenities();
  }
);

const amenitySlice = createSlice({
  name: "amenities",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmenities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default amenitySlice.reducer;
