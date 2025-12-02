# Restaurants API

This document describes the restaurant-related API endpoints and the recommended payloads for "small" (summary) and "full" (detail) views. Use the summary endpoints for fast listing and the full endpoints when the client needs more associations (images, halls, etc.).

## Endpoints

- GET /api/restaurants

  - Returns paginated list of restaurants (summary fields). Good for listing pages.

- GET /api/restaurants/available

  - Returns available restaurants (summary fields).

- GET /api/restaurants/:id/summary
  - Returns a compact representation of the restaurant suitable for detail cards or modal previews.
  - Response example:

```json
{
  "restaurantID": 123,
  "name": "Nhà hàng ABC",
  "description": "Không gian đẹp, phục vụ chuyên nghiệp",
  "hallCount": 2,
  "thumbnailURL": "https://cdn.example.com/thumb.jpg",
  "status": true,
  "address": "123 Đường A, Quận B"
}
```

- GET /api/restaurants/:id/full
  - Returns the full restaurant detail including images and address (may include halls via other endpoints).
  - Response example:

```json
{
  "restaurantID": 123,
  "restaurantPartnerID": 55,
  "name": "Nhà hàng ABC",
  "description": "Không gian đẹp, phục vụ chuyên nghiệp",
  "hallCount": 2,
  "addressID": 9,
  "thumbnailURL": "https://cdn.example.com/thumb.jpg",
  "status": true,
  "address": "123 Đường A, Quận B",
  "images": [
    { "imageID": 1, "imageURL": "https://cdn.example.com/1.jpg" },
    { "imageID": 2, "imageURL": "https://cdn.example.com/2.jpg" }
  ]
}
```

Note: the `/full` endpoint now also includes the following collections when available: `menus`, `dishes`, `promotions`, and `services` (each is an array). Example additions:

```json
{
  "menus": [{ "menuID": 1, "name": "Set A", "price": 1200 }],
  "dishes": [{ "dishID": 11, "name": "Gỏi cuốn", "price": 50 }],
  "promotions": [
    { "promotionID": 9, "title": "SUMMER10", "discountPercentage": 10 }
  ],
  "services": [{ "serviceID": 3, "name": "MC", "price": 500 }]
}
```

Additionally, the `/full` endpoint includes `halls` (array) containing the restaurant's halls. Example:

```json
{
  "halls": [
    { "hallID": 7, "name": "Main Hall", "price": 20000, "maxTable": 50 }
  ]
}
```

- GET /api/restaurants/:id

  - Backwards compatible. Currently returns the same as `/full`.

- GET /api/restaurants/:id/detail

  - Alias for `/full` (keeps compatibility with older clients that expect `/detail`).

- GET /api/restaurants/partner/:partnerID

  - List restaurants for a partner (summary fields)

- POST /api/restaurants

  - Create a restaurant. Expect body with required fields: `name`, `restaurantPartnerID`, `address` (object), `thumbnailURL`.

- PUT /api/restaurants/:id

  - Update restaurant data (address update performed in transaction)

- DELETE /api/restaurants/:id
  - Toggle restaurant status (soft-delete behavior)

## Design notes and recommendations

- Use `GET /api/restaurants/:id/summary` for initial page rendering where you want a fast small payload.
- Use `GET /api/restaurants/:id/full` only when the client needs images and additional associations.
- For large collections (menus, dishes, services), expose separate endpoints (e.g. `/api/restaurants/:id/menus`) with pagination.
- Consider adding a query param `include=` for clients that need more flexibility (server should validate and limit includes).
- Add caching headers where appropriate (ETag/Cache-Control) and serve images via CDN.

## Example: client flow

1. Listing page: call `GET /api/restaurants?page=1&limit=20` (summary fields)
2. User clicks a restaurant: prefetch `GET /api/restaurants/:id/summary` and open modal
3. When user opens "Gallery" tab, lazy-load `/api/restaurants/:id/full` or `/api/restaurants/:id/images`

---

If you want, I can also:

- Implement pagination params for the `GET /api/restaurants` endpoint
- Add `include=` param handling to the `getByID` service to support `?include=images,halls` with server-side limits
- Create frontend examples (React + RTK Query) to consume the summary/full endpoints and prefetch
