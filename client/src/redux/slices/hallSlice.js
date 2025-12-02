import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as hallService from "../../services/HallService";

/* helper */
const getErrorMessage = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error) return err.error;
  return JSON.stringify(err);
};

/* Async thunks */
export const fetchHallsByRestaurant = createAsyncThunk(
  "halls/fetchByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const data = await hallService.getHallsByRestaurant(restaurantId);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchHallById = createAsyncThunk(
  "halls/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await hallService.getHallById(id);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createHall = createAsyncThunk(
  "halls/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await hallService.createHall(payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateHall = createAsyncThunk(
  "halls/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await hallService.updateHall(id, payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteHall = createAsyncThunk(
  "halls/delete",
  async (id, { rejectWithValue }) => {
    try {
      await hallService.deleteHall(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateHallStatus = createAsyncThunk(
  "halls/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await hallService.updateHallStatus(id, status);
      return data; // expect updated hall object
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addHallImage = createAsyncThunk(
  "halls/addImage",
  async ({ hallID, imageURL }, { rejectWithValue }) => {
    try {
      const data = await hallService.addHallImage({ hallID, imageURL });
      return data; // { imageID, hallID, imageURL }
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchHallImages = createAsyncThunk(
  "halls/fetchImages",
  async (hallId, { rejectWithValue }) => {
    try {
      const data = await hallService.getHallImages(hallId);
      return { hallId, images: data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const removeHallImage = createAsyncThunk(
  "halls/deleteImage",
  async ({ imageId, hallId }, { rejectWithValue }) => {
    try {
      await hallService.deleteHallImage(imageId);
      return { imageId, hallId };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchAvailableHalls = createAsyncThunk(
  "halls/fetchAvailable",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await hallService.getAvailableHalls(params);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/* Slice */
const initialState = {
  list: [], // halls of the current context (e.g., by restaurant)
  current: null,
  availableHalls: [], // available halls based on search criteria
  imagesByHall: {}, // { [hallId]: [{imageID, imageURL}, ...] }
  status: "idle",
  error: null,
};

const hallSlice = createSlice({
  name: "halls",
  initialState,
  reducers: {
    clearCurrentHall(state) {
      state.current = null;
      state.error = null;
    },
    clearHallError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHallsByRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHallsByRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchHallsByRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      .addCase(fetchHallById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHallById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload ?? null;
        state.error = null;
      })
      .addCase(fetchHallById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      .addCase(createHall.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createHall.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) state.list.unshift(action.payload);
        state.error = null;
      })
      .addCase(createHall.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      .addCase(updateHall.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateHall.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updated = action.payload;
        const idx = state.list.findIndex((h) => h.hallID === updated.hallID);
        if (idx !== -1) state.list[idx] = updated;
        if (state.current && state.current.hallID === updated.hallID) state.current = updated;
        state.error = null;
      })
      .addCase(updateHall.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      .addCase(deleteHall.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteHall.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;
        state.list = state.list.filter((h) => h.hallID !== id);
        if (state.current && state.current.hallID === id) state.current = null;
        state.error = null;
      })
      .addCase(deleteHall.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      .addCase(updateHallStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateHallStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updated = action.payload;
        const idx = state.list.findIndex((h) => h.hallID === updated.hallID);
        if (idx !== -1) state.list[idx] = updated;
        if (state.current && state.current.hallID === updated.hallID) state.current = updated;
        state.error = null;
      })
      .addCase(updateHallStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      .addCase(addHallImage.fulfilled, (state, action) => {
        const { hallID, imageID, imageURL } = action.payload || {};
        if (!hallID || !imageURL) return;
        // update imagesByHall
        const arr = state.imagesByHall[hallID] || [];
        const next = [...arr, { imageID, imageURL }];
        state.imagesByHall[hallID] = next;
        // also patch list/current if they carry images
        const inList = state.list.find((h) => h.hallID === hallID);
        if (inList) {
          if (!Array.isArray(inList.images)) inList.images = [];
          inList.images.push({ imageID, imageURL });
        }
        if (state.current && state.current.hallID === hallID) {
          if (!Array.isArray(state.current.images)) state.current.images = [];
          state.current.images.push({ imageID, imageURL });
        }
      })

      .addCase(fetchHallImages.fulfilled, (state, action) => {
        const { hallId, images } = action.payload || {};
        if (hallId) state.imagesByHall[hallId] = images || [];
      })

      .addCase(removeHallImage.fulfilled, (state, action) => {
        const { hallId, imageId } = action.payload || {};
        if (!hallId || !imageId) return;
        const arr = state.imagesByHall[hallId] || [];
        state.imagesByHall[hallId] = arr.filter((img) => img.imageID !== imageId);
        // also patch list/current
        const inList = state.list.find((h) => h.hallID === hallId);
        if (inList && Array.isArray(inList.images)) inList.images = inList.images.filter((img) => img.imageID !== imageId);
        if (state.current && state.current.hallID === hallId && Array.isArray(state.current.images)) {
          state.current.images = state.current.images.filter((img) => img.imageID !== imageId);
        }
      })

      .addCase(fetchAvailableHalls.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAvailableHalls.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.availableHalls = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchAvailableHalls.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      });
  },
});

export const { clearCurrentHall, clearHallError } = hallSlice.actions;

export const selectHalls = (state) => state.halls?.list ?? [];
export const selectCurrentHall = (state) => state.halls?.current ?? null;
export const selectAvailableHalls = (state) => state.halls?.availableHalls ?? [];
export const selectHallImages = (hallId) => (state) => state.halls?.imagesByHall?.[hallId] ?? [];

export default hallSlice.reducer;
