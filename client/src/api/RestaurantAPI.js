
const API_BASE_URL = "http://localhost:5000/api"; // backend base URL

export async function fetchRestaurants(location = "danang") {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/search?location=${location}`);
    if (!response.ok) {
      throw new Error("Failed to fetch restaurants");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchRestaurants:", error);
    return [];
  }
}
