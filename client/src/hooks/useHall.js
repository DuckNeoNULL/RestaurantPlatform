import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHallsByRestaurant,
  fetchHallById,
  fetchAvailableHalls,
  createHall,
  updateHall,
  deleteHall,
  updateHallStatus,
  addHallImage,
  fetchHallImages,
  removeHallImage,
  clearCurrentHall,
  clearHallError,
  selectHalls,
  selectCurrentHall,
  selectAvailableHalls,
} from "../redux/slices/hallSlice";

/**
 * useHall hook
 * Exposes selectors and actions for managing halls via Redux thunks
 */
export function useHall() {
  const dispatch = useDispatch();

  // selectors
  const list = useSelector(selectHalls);
  const current = useSelector(selectCurrentHall);
  const availableHalls = useSelector(selectAvailableHalls);
  const status = useSelector((s) => s.halls?.status);
  const error = useSelector((s) => s.halls?.error);
  const imagesByHall = useSelector((s) => s.halls?.imagesByHall || {});

  // convenient accessor for images of a hall
  const selectImages = useCallback(
    (hallId) => imagesByHall[hallId] || [],
    [imagesByHall]
  );

  // actions
  const loadByRestaurant = useCallback(
    async (restaurantId) => {
      const action = await dispatch(fetchHallsByRestaurant(restaurantId));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const loadById = useCallback(
    async (id) => {
      const action = await dispatch(fetchHallById(id));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const loadAvailable = useCallback(
    async (params = {}) => {
      const action = await dispatch(fetchAvailableHalls(params));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const createOne = useCallback(
    async (payload) => {
      const action = await dispatch(createHall(payload));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const updateOne = useCallback(
    async ({ id, payload }) => {
      const action = await dispatch(updateHall({ id, payload }));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const removeOne = useCallback(
    async (id) => {
      const action = await dispatch(deleteHall(id));
      if (action.error) throw action.payload || action.error.message;
      return action.payload; // returns deleted id
    },
    [dispatch]
  );

  const updateStatus = useCallback(
    async ({ id, status }) => {
      const action = await dispatch(updateHallStatus({ id, status }));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const addImageToHall = useCallback(
    async ({ hallID, imageURL }) => {
      const action = await dispatch(addHallImage({ hallID, imageURL }));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const loadImages = useCallback(
    async (hallId) => {
      const action = await dispatch(fetchHallImages(hallId));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const removeImage = useCallback(
    async ({ imageId, hallId }) => {
      const action = await dispatch(removeHallImage({ imageId, hallId }));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const clear = useCallback(() => dispatch(clearCurrentHall()), [dispatch]);
  const clearErr = useCallback(() => dispatch(clearHallError()), [dispatch]);

  return {
    list,
    current,
    availableHalls,
    status,
    error,
    imagesByHall,
    selectImages,
    loadByRestaurant,
    loadById,
    loadAvailable,
    createOne,
    updateOne,
    removeOne,
    updateStatus,
    addImageToHall,
    loadImages,
    removeImage,
    clear,
    clearErr,
  };
}
