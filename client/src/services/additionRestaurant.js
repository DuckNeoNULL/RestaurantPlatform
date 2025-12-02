// Services for restaurant additions: Menus, Dishes, Promotions, Services

const MENUS_API = "/api/menus";
const DISHES_API = "/api/dishes";
const PROMOTIONS_API = "/api/promotions";
const DISH_CATEGORIES_API = "/api/dishcategories";
const SERVICES_API = "/api/services";

// Helper to parse JSON safely
const parseJson = async (res, fallback) => {
	try {
		return await res.json();
	} catch {
		return fallback;
	}
};

// Menus
export const createMenu = async (payload) => {
	const res = await fetch(`${MENUS_API}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Create menu failed");
	return data;
};

export const updateMenu = async (id, payload) => {
	const res = await fetch(`${MENUS_API}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Update menu failed");
	return data;
};

export const deleteMenu = async (id) => {
	const res = await fetch(`${MENUS_API}/${id}`, {
		method: "DELETE",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Delete menu failed");
	return true;
};

export const getMenusByRestaurant = async (restaurantId) => {
	const res = await fetch(`${MENUS_API}/restaurant/${restaurantId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, []);
	if (!res.ok) throw data || new Error("Fetch menus failed");
	return data;
};
export const getMenusById = async (menuId) => {
	const res = await fetch(`${MENUS_API}/${menuId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Fetch menu failed");
	return data;
};
// Dishes
export const createDish = async (payload) => {
	const res = await fetch(`${DISHES_API}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Create dish failed");
	return data;
};

export const updateDish = async (id, payload) => {
	const res = await fetch(`${DISHES_API}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Update dish failed");
	return data;
};

export const deleteDish = async (id) => {
	const res = await fetch(`${DISHES_API}/${id}`, {
		method: "DELETE",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Delete dish failed");
	return true;
};

export const getDishesByRestaurant = async (restaurantId) => {
	const res = await fetch(`${DISHES_API}/restaurant/${restaurantId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, []);
	if (!res.ok) throw data || new Error("Fetch dishes failed");
	return data;
};

// Promotions
export const createPromotion = async (payload) => {
	const res = await fetch(`${PROMOTIONS_API}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Create promotion failed");
	return data;
};

export const updatePromotion = async (id, payload) => {
	const res = await fetch(`${PROMOTIONS_API}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Update promotion failed");
	return data;
};

export const deletePromotion = async (id) => {
	const res = await fetch(`${PROMOTIONS_API}/${id}`, {
		method: "DELETE",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Delete promotion failed");
	return true;
};

export const getPromotionsByRestaurant = async (restaurantId) => {
	const res = await fetch(`${PROMOTIONS_API}/restaurant/${restaurantId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, []);
	if (!res.ok) throw data || new Error("Fetch promotions failed");
	return data;
};

export const getPromotions = async (params = {}) => {
	const qp = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== "") qp.set(k, String(v));
	});
	const res = await fetch(`${PROMOTIONS_API}?${qp.toString()}`, {
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, []);
	if (!res.ok) throw data || new Error("Fetch promotions failed");
	return Array.isArray(data) ? data : data?.promotions ?? [];
};

// Dish Categories
export const createDishCategory = async (payload) => {
	const res = await fetch(`${DISH_CATEGORIES_API}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Create dish category failed");
	return data;
};

export const updateDishCategory = async (id, payload) => {
	const res = await fetch(`${DISH_CATEGORIES_API}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Update dish category failed");
	return data;
};

export const deleteDishCategory = async (id) => {
	const res = await fetch(`${DISH_CATEGORIES_API}/${id}`, {
		method: "DELETE",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Delete dish category failed");
	return true;
};

export const getDishCategoriesByRestaurant = async (restaurantId) => {
	const res = await fetch(`${DISH_CATEGORIES_API}/restaurant/${restaurantId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, []);
	if (!res.ok) throw data || new Error("Fetch dish categories failed");
	return data;
};

// Services
export const createService = async (payload) => {
	const res = await fetch(`${SERVICES_API}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Create service failed");
	return data;
};

export const updateService = async (id, payload) => {
	const res = await fetch(`${SERVICES_API}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Update service failed");
	return data;
};

export const deleteService = async (id) => {
	const res = await fetch(`${SERVICES_API}/${id}`, {
		method: "DELETE",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, {});
	if (!res.ok) throw data || new Error("Delete service failed");
	return true;
};

export const getServicesByRestaurant = async (restaurantId) => {
	const res = await fetch(`${SERVICES_API}/restaurant/${restaurantId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, []);
	if (!res.ok) throw data || new Error("Fetch services failed");
	return data;
};

// Promotions
export const getPromotionsBySearch = async (params = {}) => {
	const query = new URLSearchParams();
	if (params.eventType) query.append('eventType', params.eventType);
	if (params.date) query.append('date', params.date);
	if (params.tables) query.append('tables', params.tables);
	if (params.restaurantId) query.append('restaurantId', params.restaurantId);
	const queryString = query.toString();
	const url = `${PROMOTIONS_API}${queryString ? `?${queryString}` : ''}`;
	const res = await fetch(url, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await parseJson(res, []);
	if (!res.ok) throw data || new Error("Fetch promotions failed");
	return data;
};
