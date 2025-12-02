import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// fetch từ API backend
export const fetchWards = createAsyncThunk(
  "wards/fetchWards",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/wards");
      if (!res.ok) throw new Error("Không thể tải danh sách phường");
      const data = await res.json();
      const wards = Array.isArray(data) ? data : (data?.wards ?? []);
      return wards;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const wardSlice = createSlice({
  name: "wards",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWards.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchWards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
  },
})
export const selectWards = (state) => state.wards?.list ?? [];
export default wardSlice.reducer;