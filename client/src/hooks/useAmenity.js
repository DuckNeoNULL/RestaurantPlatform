import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAmenities } from "../redux/slices/amenitySlice";

export default function useAmenity() {
  const dispatch = useDispatch();
  const { list = [], loading = false, error = null } = useSelector((state) => state.amenities || {});

  useEffect(() => {
    if (!list || list.length === 0) {
      dispatch(fetchAmenities());
    }
  }, [dispatch, list]);

  return { amenities: list, loading, error };
}
