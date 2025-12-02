import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as additionService from "../../services/additionRestaurant";

// Common error message helper
const getErrorMessage = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error) return err.error;
  return JSON.stringify(err);
};

// Menus
export const fetchDishCategoriesByRestaurant = createAsyncThunk(
  "addition/dishCategoriesByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      return await additionService.getDishCategoriesByRestaurant(restaurantId);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createDishCategory = createAsyncThunk(
  "addition/createDishCategory",
  async (payload, { rejectWithValue }) => {
    try {
      return await additionService.createDishCategory(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateDishCategory = createAsyncThunk(
  "addition/updateDishCategory",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await additionService.updateDishCategory(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteDishCategory = createAsyncThunk(
  "addition/deleteDishCategory",
  async (id, { rejectWithValue }) => {
    try {
      await additionService.deleteDishCategory(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
export const fetchMenusByRestaurant = createAsyncThunk(
  "addition/menusByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      return await additionService.getMenusByRestaurant(restaurantId);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createMenu = createAsyncThunk(
  "addition/createMenu",
  async (payload, { rejectWithValue }) => {
    try {
      return await additionService.createMenu(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateMenu = createAsyncThunk(
  "addition/updateMenu",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await additionService.updateMenu(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteMenu = createAsyncThunk(
  "addition/deleteMenu",
  async (id, { rejectWithValue }) => {
    try {
      await additionService.deleteMenu(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchMenuById = createAsyncThunk(
  "addition/fetchMenuById",
  async (menuId, { rejectWithValue }) => {
    try {
      return await additionService.getMenusById(menuId);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Dishes
export const fetchDishesByRestaurant = createAsyncThunk(
  "addition/dishesByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      return await additionService.getDishesByRestaurant(restaurantId);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createDish = createAsyncThunk(
  "addition/createDish",
  async (payload, { rejectWithValue }) => {
    try {
      return await additionService.createDish(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateDish = createAsyncThunk(
  "addition/updateDish",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await additionService.updateDish(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteDish = createAsyncThunk(
  "addition/deleteDish",
  async (id, { rejectWithValue }) => {
    try {
      await additionService.deleteDish(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Promotions
export const fetchPromotionsByRestaurant = createAsyncThunk(
  "addition/promotionsByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      return await additionService.getPromotionsByRestaurant(restaurantId);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchPromotions = createAsyncThunk(
  "addition/fetchPromotions",
  async (params, { rejectWithValue }) => {
    try {
      return await additionService.getPromotionsBySearch(params);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createPromotion = createAsyncThunk(
  "addition/createPromotion",
  async (payload, { rejectWithValue }) => {
    try {
      return await additionService.createPromotion(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updatePromotion = createAsyncThunk(
  "addition/updatePromotion",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await additionService.updatePromotion(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deletePromotion = createAsyncThunk(
  "addition/deletePromotion",
  async (id, { rejectWithValue }) => {
    try {
      await additionService.deletePromotion(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Services
export const fetchServicesByRestaurant = createAsyncThunk(
  "addition/servicesByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      return await additionService.getServicesByRestaurant(restaurantId);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createService = createAsyncThunk(
  "addition/createService",
  async (payload, { rejectWithValue }) => {
    try {
      return await additionService.createService(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateService = createAsyncThunk(
  "addition/updateService",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await additionService.updateService(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteService = createAsyncThunk(
  "addition/deleteService",
  async (id, { rejectWithValue }) => {
    try {
      await additionService.deleteService(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const initialState = {
  menus: [],
  dishes: [],
  dishCategories: [],
  promotions: [],
  services: [],
  status: "idle",
  error: null,
};

const additionSlice = createSlice({
  name: "additionRestaurant",
  initialState,
  reducers: {
    clearAdditionError(state) {
      state.error = null;
    },
    clearAllAdditions(state) {
      state.menus = [];
      state.dishes = [];
      state.dishCategories = [];
      state.promotions = [];
      state.services = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dish Categories
      .addCase(fetchDishCategoriesByRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDishCategoriesByRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dishCategories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDishCategoriesByRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(createDishCategory.fulfilled, (state, action) => {
        if (action.payload) state.dishCategories.push(action.payload); // append to bottom
      })
      .addCase(updateDishCategory.fulfilled, (state, action) => {
        const updated = action.payload || {};
        const updatedKey = String(updated.categoryID ?? updated.id ?? '');
        // Replace first match by key (string compare) and remove any duplicates with same key
        const indices = [];
        state.dishCategories.forEach((c, i) => {
          const key = String((c && (c.categoryID ?? c.id)) ?? '');
          if (key && key === updatedKey) indices.push(i);
        });
        if (indices.length > 0) {
          // Replace the first occurrence
          state.dishCategories[indices[0]] = updated;
          // Remove any subsequent duplicates (iterate from end)
          for (let j = indices.length - 1; j > 0; j--) {
            state.dishCategories.splice(indices[j], 1);
          }
        } else if (updatedKey) {
          // If not found (e.g., type mismatch previously), append once
          state.dishCategories.push(updated);
        }
      })
      .addCase(deleteDishCategory.fulfilled, (state, action) => {
        const id = action.payload;
        state.dishCategories = state.dishCategories.filter((c) => (c.categoryID ?? c.id) !== id);
      })
      // Menus
      .addCase(fetchMenusByRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMenusByRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.menus = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMenusByRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(createMenu.fulfilled, (state, action) => {
        if (action.payload) state.menus.unshift(action.payload);
      })
      .addCase(updateMenu.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.menus.findIndex((m) => m.menuID === updated.menuID || m.id === updated.id);
        if (idx !== -1) state.menus[idx] = updated;
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        const id = action.payload;
        state.menus = state.menus.filter((m) => (m.menuID ?? m.id) !== id);
      })
      .addCase(fetchMenuById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMenuById.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Optionally add to menus if not present
        const menu = action.payload;
        if (menu && !state.menus.find(m => (m.menuID ?? m.id) === (menu.menuID ?? menu.id))) {
          state.menus.push(menu);
        }
      })
      .addCase(fetchMenuById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })

      // Dishes
      .addCase(fetchDishesByRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDishesByRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dishes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDishesByRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(createDish.fulfilled, (state, action) => {
        if (action.payload) state.dishes.unshift(action.payload);
      })
      .addCase(updateDish.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.dishes.findIndex((d) => d.dishID === updated.dishID || d.id === updated.id);
        if (idx !== -1) state.dishes[idx] = updated;
      })
      .addCase(deleteDish.fulfilled, (state, action) => {
        const id = action.payload;
        state.dishes = state.dishes.filter((d) => (d.dishID ?? d.id) !== id);
      })

      // Promotions
      .addCase(fetchPromotionsByRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPromotionsByRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.promotions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPromotionsByRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        if (action.payload) state.promotions.unshift(action.payload);
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.promotions.findIndex((p) => p.promotionID === updated.promotionID || p.id === updated.id);
        if (idx !== -1) state.promotions[idx] = updated;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        const id = action.payload;
        state.promotions = state.promotions.filter((p) => (p.promotionID ?? p.id) !== id);
      })
      .addCase(fetchPromotions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.promotions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      // Services
      .addCase(fetchServicesByRestaurant.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchServicesByRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.services = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchServicesByRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(createService.fulfilled, (state, action) => {
        if (action.payload) state.services.unshift(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.services.findIndex((s) => s.serviceID === updated.serviceID || s.id === updated.id);
        if (idx !== -1) state.services[idx] = updated;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        const id = action.payload;
        state.services = state.services.filter((s) => (s.serviceID ?? s.id) !== id);
      });
  },
});

export const { clearAdditionError, clearAllAdditions } = additionSlice.actions;

export const selectMenus = (state) => state.additionRestaurant?.menus ?? [];
export const selectDishes = (state) => state.additionRestaurant?.dishes ?? [];
export const selectDishCategories = (state) => state.additionRestaurant?.dishCategories ?? [];
export const selectPromotions = (state) => state.additionRestaurant?.promotions ?? [];
export const selectServices = (state) => state.additionRestaurant?.services ?? [];
export const selectAdditionStatus = (state) => state.additionRestaurant?.status ?? "idle";
export const selectAdditionError = (state) => state.additionRestaurant?.error ?? null;

export default additionSlice.reducer;
