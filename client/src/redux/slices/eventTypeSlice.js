import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEventTypes, getAmenities } from "../../services/eventTypeAndAmenityService";

export const fetchEventTypes = createAsyncThunk(
  "eventType/fetchEventTypes",
  async () => {
    const data = await getEventTypes();
    return data;
  }
);

export const fetchAmenities = createAsyncThunk(
  "eventType/fetchAmenities",
  async () => {
    const data = await getAmenities();
    return data;
  }
);

const eventTypeSlice = createSlice({
  name: "eventType",
  initialState: {
    items: [],
    amenities: [],
    loading: false,
    amenitiesLoading: false,
    error: null,
    amenitiesError: null
  },
  extraReducers: (builder) => {
    builder
      // event types
      .addCase(fetchEventTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEventTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // amenities
      .addCase(fetchAmenities.pending, (state) => {
        state.amenitiesLoading = true;
        state.amenitiesError = null;
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.amenitiesLoading = false;
        state.amenities = action.payload;
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.amenitiesLoading = false;
        state.amenitiesError = action.error.message;
      });
  },
});

export default eventTypeSlice.reducer;