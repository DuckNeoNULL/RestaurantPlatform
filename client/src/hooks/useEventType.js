import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventTypes, fetchAmenities } from "../redux/slices/eventTypeSlice";
import { getEventTypesByRestaurant } from "../services/eventTypeAndAmenityService";

/**
 * useEventType hook
 * - Exposes event types state, amenities state and loaders
 * State shape (from slice):
 * - event types: { items: [], loading: boolean, error: string|null }
 * - amenities:   { items: [], loading: boolean, error: string|null }
 */
export function useEventType() {
    const dispatch = useDispatch();

    const items = useSelector((s) => s.eventType?.items ?? []);
    const loading = useSelector((s) => s.eventType?.loading ?? false);
    const error = useSelector((s) => s.eventType?.error ?? null);

    const amenities = useSelector((s) => s.eventType?.amenities ?? []);
    const amenitiesLoading = useSelector((s) => s.eventType?.amenitiesLoading ?? false);
    const amenitiesError = useSelector((s) => s.eventType?.amenitiesError ?? null);

    const loadAll = useCallback(async () => {
        const action = await dispatch(fetchEventTypes());
        if (action.error) throw action.payload || action.error.message;
        return action.payload;
    }, [dispatch]);

    const loadByRestaurant = useCallback(async (restaurantID) => {
        try {
            const data = await getEventTypesByRestaurant(restaurantID);
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const loadAmenities = useCallback(async () => {
        const action = await dispatch(fetchAmenities());
        if (action.error) throw action.payload || action.error.message;
        return action.payload;
    }, [dispatch]);

    return {
        items,
        loading,
        error,
        loadAll,
        loadByRestaurant,
        amenities,
        amenitiesLoading,
        amenitiesError,
        loadAmenities,
        refetch: loadAll,
        refetchAmenities: loadAmenities,
    };
}

export default useEventType;
