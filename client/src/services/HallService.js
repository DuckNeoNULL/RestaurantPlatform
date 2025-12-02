const API_URL = "/api/halls";

export const createHall = async (hallData) => {
	const res = await fetch(`${API_URL}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(hallData),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw data || new Error("Create hall failed");
	return data;
};

export const getHallById = async (id) => {
	const res = await fetch(`${API_URL}/${id}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw data || new Error("Fetch hall failed");
	return data;
};

export const getHallsByRestaurant = async (restaurantId) => {
	const res = await fetch(`${API_URL}/restaurant/${restaurantId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await res.json().catch(() => []);
	if (!res.ok) throw data || new Error("Fetch halls by restaurant failed");
	return data;
};

export const updateHall = async (id, payload) => {
	const res = await fetch(`${API_URL}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw data || new Error("Update hall failed");
	return data;
};

export const deleteHall = async (id) => {
	const res = await fetch(`${API_URL}/${id}`, {
		method: "DELETE",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw data || new Error("Delete hall failed");
	return true;
};

export const updateHallStatus = async (id, status) => {
	const res = await fetch(`${API_URL}/update/status/${id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify({ status }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw data || new Error("Update hall status failed");
	return data;
};

// Hall Images
export const addHallImage = async ({ hallID, imageURL }) => {
	const res = await fetch(`${API_URL}/images`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		credentials: "include",
		body: JSON.stringify({ hallID, imageURL }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw data || new Error("Add hall image failed");
	return data; // { imageID, hallID, imageURL }
};

export const getHallImages = async (hallId) => {
	const res = await fetch(`${API_URL}/images/${hallId}`, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await res.json().catch(() => []);
	if (!res.ok) throw data || new Error("Fetch hall images failed");
	return data;
};

export const deleteHallImage = async (imageId) => {
	const res = await fetch(`${API_URL}/images/${imageId}`, {
		method: "DELETE",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw data || new Error("Delete hall image failed");
	return true;
};

// Hall Availability
export const getAvailableHalls = async (params = {}) => {
	const queryString = new URLSearchParams(params).toString();
	const url = queryString ? `${API_URL}/available?${queryString}` : `${API_URL}/available`;
	
	const res = await fetch(url, {
		method: "GET",
		headers: { Accept: "application/json" },
		credentials: "include",
	});
	const data = await res.json().catch(() => []);
	if (!res.ok) throw data || new Error("Fetch available halls failed");
	return data;
};