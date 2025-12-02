import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as restaurantService from "../../services/restaurantService";

/* Helper: xử lý thông báo lỗi gọn gàng */
const getErrorMessage = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error) return err.error;
  return JSON.stringify(err);
};

/* ====== Async Thunks ====== */

export const fetchRestaurants = createAsyncThunk(
  "restaurants/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await restaurantService.getRestaurants();
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
export const fetchRestaurantsByPartner = createAsyncThunk(
  "restaurants/fetchByPartnerId",
  async (partnerID, { rejectWithValue }) => {
      try {
        const data = await restaurantService.getRestaurantsByPartner(partnerID);
        return data;
      } catch (err) {
        return rejectWithValue(getErrorMessage(err));
      }
    }
  );
  export const fetchToggleRestaurantStatus = createAsyncThunk(
  "restaurants/toggleStatus",
  async ({ restaurantID, newStatus }, { rejectWithValue }) => {
      try {
        const data = await restaurantService.toggleRestaurantStatus(restaurantID, newStatus);
        return data;
      } catch (err) {
        return rejectWithValue(getErrorMessage(err));
      }
    }
  );

export const fetchRestaurantById = createAsyncThunk(
  "restaurants/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await restaurantService.getRestaurantById(id);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const performSearchRestaurants = createAsyncThunk(
  "restaurants/search",
  async (params, { rejectWithValue }) => {
    try {
      const data = await restaurantService.searchRestaurants(params);

      // ✅ backend trả về { restaurants: [...] }
      if (data?.restaurants) return data.restaurants;
      if (Array.isArray(data)) return data;
      return data?.results ?? [];
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchFeaturedRestaurants = createAsyncThunk(
  "restaurants/featured",
  async (_, { rejectWithValue }) => {
    try {
      const data = await restaurantService.getFeaturedRestaurants();
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchTopRatedRestaurants = createAsyncThunk(
  "restaurants/topRated",
  async (params, { rejectWithValue }) => {
    try {
      const data = await restaurantService.getTopRatedRestaurants(params);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
//update 
export const updateRestaurant = createAsyncThunk(
  "restaurants/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await restaurantService.updateRestaurant(id, payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
export const createRestaurant = createAsyncThunk(
  "restaurants/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await restaurantService.createRestaurant(payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// add single image to a restaurant
export const addRestaurantImage = createAsyncThunk(
  "restaurants/addImage",
  async ({ restaurantID, imageURL }, { rejectWithValue }) => {
    try {
      const data = await restaurantService.addRestaurantImage(restaurantID, imageURL);
      return { restaurantID, imageURL, data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/* Slice */
const initialState = {
  list: [],
  featured: [],
  topRated: [],
  current: null,
  searchResults: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const restaurantSlice = createSlice({
  name: "restaurants",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ========== FETCH ALL ========== */
      .addCase(fetchRestaurants.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload || [];
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(fetchRestaurantsByPartner.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRestaurantsByPartner.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Expect an array of restaurants
        state.list = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchRestaurantsByPartner.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      // fetch by id
      .addCase(fetchRestaurantById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload ?? null;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      /* ========== SEARCH RESTAURANTS ========== */
      .addCase(performSearchRestaurants.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(performSearchRestaurants.fulfilled, (state, action) => {
        state.status = "succeeded";
        // ✅ chuẩn backend { restaurants: [...] }
        state.searchResults = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(performSearchRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
        state.searchResults = [];
      })

      /* ========== FEATURED ========== */
      .addCase(fetchFeaturedRestaurants.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFeaturedRestaurants.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.featured = action.payload || [];
      })
      .addCase(fetchFeaturedRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      // top rated
      .addCase(fetchTopRatedRestaurants.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTopRatedRestaurants.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.topRated = action.payload || [];
        state.error = null;
      })
      .addCase(fetchTopRatedRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      // update 
      .addCase(updateRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        // update the restaurant in list if present
        const updatedRestaurant = action.payload;
        const index = state.list.findIndex(r => r.restaurantID === updatedRestaurant.restaurantID);
        if (index !== -1) {
          state.list[index] = updatedRestaurant;
        }
        // also update current if it matches
        if (state.current && state.current.restaurantID === updatedRestaurant.restaurantID) {
          state.current = updatedRestaurant;
        }
        state.error = null;
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      // create
      .addCase(createRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) state.list.unshift(action.payload);
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      // add image
      .addCase(addRestaurantImage.pending, (state) => {
        // keep previous status semantics; could use a separate flag if needed later
        state.error = null;
      })
      .addCase(addRestaurantImage.fulfilled, (state, action) => {
        // Attempt to update images array on the matching restaurant in list/current
        const { restaurantID, imageURL } = action.payload || {};
        if (restaurantID && imageURL) {
          const inList = state.list.find((r) => r.restaurantID === restaurantID);
          if (inList) {
            if (!Array.isArray(inList.images)) inList.images = [];
            inList.images.push(imageURL);
          }
          if (state.current && state.current.restaurantID === restaurantID) {
            if (!Array.isArray(state.current.images)) state.current.images = [];
            state.current.images.push(imageURL);
          }
        }
        state.error = null;
      })
      .addCase(addRestaurantImage.rejected, (state, action) => {
        state.error = action.payload ?? action.error?.message;
      });
  },
});

/* ====== Selectors ====== */

export const { clearCurrent, clearError } = restaurantSlice.actions;

export const selectRestaurants = (state) => state.restaurants?.list ?? [];
export const selectFeaturedRestaurants = (state) => state.restaurants?.featured ?? [];
export const selectTopRatedRestaurants = (state) => state.restaurants?.topRated ?? [];
export const selectCurrentRestaurant = (state) => state.restaurants?.current ?? null;
export const selectSearchResults = (state) => state.restaurants?.searchResults ?? [];
export default restaurantSlice.reducer;
