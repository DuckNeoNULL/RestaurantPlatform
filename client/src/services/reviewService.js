const API_URL = "/api/restaurants";

export const getReviewsForRestaurant = async (restaurantID) => {
  const res = await fetch(`${API_URL}/${restaurantID}/reviews`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw data || new Error("Fetch reviews failed");
  return data;
};

export const getReviewsForBooking = async (restaurantID, bookingID) => {
  const res = await fetch(`${API_URL}/${restaurantID}/reviews/booking/${bookingID}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw data || new Error("Fetch reviews for booking failed");
  return data;
};

export const createReview = async (restaurantID, reviewData) => {
  const res = await fetch(`${API_URL}/${restaurantID}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw data || new Error("Create review failed");
  return data;
};

export const updateReview = async (restaurantID, reviewID, reviewData) => {
  const res = await fetch(`${API_URL}/${restaurantID}/reviews/${reviewID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw data || new Error("Update review failed");
  return data;
};

export const deleteReview = async (restaurantID, reviewID) => {
  const res = await fetch(`${API_URL}/${restaurantID}/reviews/${reviewID}`, {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data || new Error("Delete review failed");
  return true;
};