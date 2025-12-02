import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPromotionsByRestaurant,
  createPromotion,
  updatePromotion,
  deletePromotion,
  selectPromotions,
  selectAdditionStatus,
  selectAdditionError,
  clearAdditionError,
} from "../redux/slices/additionRestaurantSlice";

/**
 * usePromotion hook
 * Exposes selectors and actions for managing promotions via Redux thunks
 */
export function usePromotion() {
  const dispatch = useDispatch();

  // selectors
  const list = useSelector(selectPromotions);
  const status = useSelector(selectAdditionStatus);
  const error = useSelector(selectAdditionError);

  // actions
  const loadByRestaurant = useCallback(
    async (restaurantId) => {
      const action = await dispatch(fetchPromotionsByRestaurant(restaurantId));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const createOne = useCallback(
    async (payload) => {
      const action = await dispatch(createPromotion(payload));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const updateOne = useCallback(
    async ({ id, payload }) => {
      const action = await dispatch(updatePromotion({ id, payload }));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch]
  );

  const removeOne = useCallback(
    async (id) => {
      const action = await dispatch(deletePromotion(id));
      if (action.error) throw action.payload || action.error.message;
      return action.payload; // deleted id
    },
    [dispatch]
  );

  const clearErr = useCallback(() => dispatch(clearAdditionError()), [dispatch]);

  return {
    list,
    status,
    error,
    loadByRestaurant,
    createOne,
    updateOne,
    removeOne,
    clearErr,
  };
}
