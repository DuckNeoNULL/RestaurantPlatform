import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReviewsForRestaurant,
  fetchReviewsForBooking,
  createReview as createReviewThunk,
  updateReview as updateReviewThunk,
  deleteReview as deleteReviewThunk,
  clearCurrent,
  clearError,
  selectReviews,
  selectCurrentReview,
} from "../redux/slices/reviewSlice";

/**
 * useReview hook
 * - exposes selectors and actions for reviews
 */
export function useReview() {
  const dispatch = useDispatch();
  const list = useSelector(selectReviews);
  const current = useSelector(selectCurrentReview);
  const status = useSelector((s) => s.reviews?.status);
  const error = useSelector((s) => s.reviews?.error);

  const loadForRestaurant = useCallback(
    async (restaurantID) => {
      const action = await dispatch(fetchReviewsForRestaurant(restaurantID));
      if (action.error) throw action.payload;
      return action.payload;
    },
    [dispatch]
  );

  const loadForBooking = useCallback(
    async (restaurantID, bookingID) => {
      const action = await dispatch(fetchReviewsForBooking({ restaurantID, bookingID }));
      if (action.error) throw action.payload;
      return action.payload;
    },
    [dispatch]
  );

  const createOne = useCallback(
    async (restaurantID, reviewData) => {
      const action = await dispatch(createReviewThunk({ restaurantID, reviewData }));
      if (action.error) throw action.payload;
      return action.payload;
    },
    [dispatch]
  );

  const updateOne = useCallback(
    async (restaurantID, reviewID, reviewData) => {
      const action = await dispatch(updateReviewThunk({ restaurantID, reviewID, reviewData }));
      if (action.error) throw action.payload;
      return action.payload;
    },
    [dispatch]
  );

  const deleteOne = useCallback(
    async (restaurantID, reviewID) => {
      const action = await dispatch(deleteReviewThunk({ restaurantID, reviewID }));
      if (action.error) throw action.payload;
      return action.payload;
    },
    [dispatch]
  );

  const clear = useCallback(() => dispatch(clearCurrent()), [dispatch]);
  const clearErr = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    list,
    current,
    status,
    error,
    loadForRestaurant,
    loadForBooking,
    createOne,
    updateOne,
    deleteOne,
    clear,
    clearErr,
  };
}