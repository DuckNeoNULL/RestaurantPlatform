import { useCallback, useEffect, useRef, useState } from "react";
import { getRestaurants, getRestaurantById } from "../services/restaurantService";

// Hook: fetch list of restaurants
export function useRestaurants({ auto = true } = {}) {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(auto);
	const [error, setError] = useState(null);
	const abortRef = useRef(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		return () => {
			mountedRef.current = false;
			if (abortRef.current) abortRef.current.abort();
		};
	}, []);

	const fetchAll = useCallback(async () => {
		setLoading(true);
		setError(null);
		if (abortRef.current) abortRef.current.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		// Failsafe timeout: abort after 10s to prevent infinite loading
		const timeoutId = setTimeout(() => {
			if (abortRef.current) {
				console.warn("[useRestaurants] aborting request due to timeout");
				abortRef.current.abort();
			}
		}, 10000);

		try {
			const res = await getRestaurants({ signal: controller.signal });
			if (!mountedRef.current) return;
			setData(Array.isArray(res) ? res : []);
		} catch (err) {
			if (!mountedRef.current) return;
			if (err.name !== "AbortError") setError(err);
		} finally {
			clearTimeout(timeoutId);
			if (mountedRef.current) setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (auto) fetchAll();
	}, [auto, fetchAll]);

	return { data, loading, error, refetch: fetchAll };
}

// Hook: fetch single restaurant by id
export function useRestaurant(id, { enabled = true } = {}) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(!!(enabled && id));
	const [error, setError] = useState(null);
	const abortRef = useRef(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		return () => {
			mountedRef.current = false;
			if (abortRef.current) abortRef.current.abort();
		};
	}, []);

	const fetchOne = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		setError(null);
		if (abortRef.current) abortRef.current.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		const timeoutId = setTimeout(() => {
			if (abortRef.current) {
				console.warn("[useRestaurant] aborting request due to timeout");
				abortRef.current.abort();
			}
		}, 10000);

		try {
			const res = await getRestaurantById(id, { signal: controller.signal });
			if (!mountedRef.current) return;
			setData(res ?? null);
		} catch (err) {
			if (!mountedRef.current) return;
			if (err.name !== "AbortError") setError(err);
		} finally {
			clearTimeout(timeoutId);
			if (mountedRef.current) setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (enabled && id) fetchOne();
	}, [enabled, id, fetchOne]);

	return { data, loading, error, refetch: fetchOne };
}

// Convenience default export
export default { useRestaurants, useRestaurant };

