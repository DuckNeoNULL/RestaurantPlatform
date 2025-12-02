# Restaurant management — SQL queries (no DDL)

This file contains SQL snippets (SELECT/INSERT/UPDATE/DELETE and transactional samples) that map to DAO methods found in `server/src/dao/RestaurantDAO.js`, `RestaurantImageDAO.js`, `HallDAO.js`, `MenuDAO.js`, `DishDAO.js`, `AmenityDAO.js`, `EventTypeDAO.js`.

Use `?` placeholders (or your client-specific placeholders) for parameters.

---

## RestaurantDAO

### getAll()

Return all restaurants with address and a thumbnail summary.

```sql
SELECT r.restaurantID, r.restaurantPartnerID, r.name, r.description, r.hallCount, r.addressID, r.thumbnailURL, r.status,
       a.fullAddress
FROM restaurant r
LEFT JOIN address a ON a.addressID = r.addressID
ORDER BY r.restaurantID ASC;
```

### getAvailable()

Active restaurants only:

```sql
SELECT r.restaurantID, r.restaurantPartnerID, r.name, r.description, r.hallCount, r.addressID, r.thumbnailURL, r.status,
       a.fullAddress
FROM restaurant r
LEFT JOIN address a ON a.addressID = r.addressID
WHERE r.status = 1;
```

### getAllByPartnerID(restaurantPartnerID)

```sql
SELECT r.restaurantID, r.restaurantPartnerID, r.name, r.description, r.hallCount, r.addressID, r.thumbnailURL, r.status,
       a.fullAddress
FROM restaurant r
LEFT JOIN address a ON a.addressID = r.addressID
WHERE r.restaurantPartnerID = ?;
```

### getByID(restaurantID)

Include images and address:

```sql
-- restaurant basic
SELECT r.*, a.fullAddress
FROM restaurant r
LEFT JOIN address a ON a.addressID = r.addressID
WHERE r.restaurantID = ?;

-- images
SELECT imageID, restaurantID, imageURL FROM restaurantimage WHERE restaurantID = ? ORDER BY imageID ASC;
```

### createRestaurant(data)

Typical DAO creates address, then restaurant, then images in a transaction.

```sql
START TRANSACTION;

-- insert address
INSERT INTO address (number, street, ward, district, city, fullAddress, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());
SET @address_id = LAST_INSERT_ID();

-- insert restaurant
INSERT INTO restaurant (restaurantPartnerID, name, description, hallCount, addressID, thumbnailURL, status, createdAt, updatedAt)
VALUES (?, ?, ?, 0, @address_id, ?, 1, NOW(), NOW());
SET @restaurant_id = LAST_INSERT_ID();

-- insert images (repeat as needed)
INSERT INTO restaurantimage (restaurantID, imageURL) VALUES (@restaurant_id, ?);

COMMIT;
```

Notes: DAO may compute `hallCount` and insert menus/halls later.

### updateRestaurant(restaurantID, data)

Common pattern: update restaurant row; upsert address if provided (update address table or create new one and set addressID).

```sql
START TRANSACTION;

-- optionally update address
UPDATE address SET number = COALESCE(?, number), street = COALESCE(?, street), ward = COALESCE(?, ward), district = COALESCE(?, district), city = COALESCE(?, city), fullAddress = COALESCE(?, fullAddress), updatedAt = NOW()
WHERE addressID = ?;

-- update restaurant
UPDATE restaurant
SET restaurantPartnerID = COALESCE(?, restaurantPartnerID),
    name = COALESCE(?, name),
    description = COALESCE(?, description),
    thumbnailURL = COALESCE(?, thumbnailURL),
    updatedAt = NOW()
WHERE restaurantID = ?;

COMMIT;
```

If address needs inserting instead of updating, insert and update restaurant.addressID to new id.

### toggleRestaurantStatus(restaurantID)

Flip boolean status or set explicit value.

```sql
UPDATE restaurant
SET status = NOT status, updatedAt = NOW()
WHERE restaurantID = ?;

-- or explicit
UPDATE restaurant SET status = ?, updatedAt = NOW() WHERE restaurantID = ?;
```

### search({location, capacity, date, minPrice, maxPrice})

Simplified example: location partial match (address.fullAddress), capacity filter (via halls), price filter (via menu price or hall price). This is typically implemented with dynamic SQL built in DAO.

Example: find restaurants matching location and having halls with capacity >= :capacity and a menu price between min/max.

```sql
SELECT DISTINCT r.restaurantID, r.name, r.description, r.thumbnailURL, a.fullAddress
FROM restaurant r
LEFT JOIN address a ON a.addressID = r.addressID
LEFT JOIN hall h ON h.restaurantID = r.restaurantID
LEFT JOIN menu m ON m.restaurantID = r.restaurantID
WHERE (? IS NULL OR a.fullAddress LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR h.maxTable >= ?)
  AND (? IS NULL OR m.price >= ?)
  AND (? IS NULL OR m.price <= ?)
  AND r.status = 1
LIMIT 100;
```

Note: The DAO's `search` may include date-based availability checks using booking table and hall availability logic.

---

## RestaurantImageDAO

### getByRestaurantID(restaurantID)

```sql
SELECT imageID, restaurantID, imageURL FROM restaurantimage WHERE restaurantID = ? ORDER BY imageID ASC;
```

### getByID(imageID)

```sql
SELECT imageID, restaurantID, imageURL FROM restaurantimage WHERE imageID = ?;
```

### addImage(restaurantID, imageURL)

```sql
INSERT INTO restaurantimage (restaurantID, imageURL) VALUES (?, ?);
-- return LAST_INSERT_ID()
```

### deleteImage(imageID)

```sql
DELETE FROM restaurantimage WHERE imageID = ?;
```

---

## HallDAO

### createHall(hallData)

Typical transaction: insert hall row and optionally related records.

```sql
INSERT INTO hall (restaurantID, name, description, capacity, minTable, maxTable, area, price, status, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW());
-- return LAST_INSERT_ID()
```

### getHallById(hallID)

```sql
SELECT * FROM hall WHERE hallID = ?;
```

### getHallsByRestaurantId(restaurantID)

```sql
SELECT * FROM hall WHERE restaurantID = ? ORDER BY hallID ASC;
```

### updateHall(hallID, hallData)

```sql
UPDATE hall SET name = COALESCE(?, name), description = COALESCE(?, description), maxTable = COALESCE(?, maxTable), minTable = COALESCE(?, minTable), area = COALESCE(?, area), price = COALESCE(?, price), updatedAt = NOW()
WHERE hallID = ?;
```

### deleteHall(hallID)

If there are bookings or dependent rows, the DAO used transaction delete with checks. Example:

```sql
START TRANSACTION;
-- optional: check active bookings
SELECT 1 FROM booking WHERE hallID = ? AND status IN ('PENDING','ACCEPTED','CONFIRMED','DEPOSITED') LIMIT 1;
-- if none
DELETE FROM hall WHERE hallID = ?;
COMMIT;
```

### updateHallStatus(hallID, status)

```sql
UPDATE hall SET status = ?, updatedAt = NOW() WHERE hallID = ?;
```

### isAvailableForRange(hallID, eventDate, startTime, endTime)

Check overlapping bookings (same logic as Booking overlap):

```sql
SELECT bookingID FROM booking
WHERE hallID = ?
  AND eventDate = ?
  AND NOT (endTime <= ? OR startTime >= ?)
  AND status IN ('PENDING','ACCEPTED','CONFIRMED','DEPOSITED')
LIMIT 1;
-- if no rows => available
```

### markEndedBookingsCompleted(hallID, now)

Mark bookings whose event end is before `now` as COMPLETED (if currently CONFIRMED / DEPOSITED):

```sql
UPDATE booking
SET status = 'COMPLETED', updatedAt = NOW()
WHERE hallID = ?
  AND (STR_TO_DATE(CONCAT(eventDate, ' ', endTime), '%Y-%m-%d %H:%i:%s') < ?)
  AND status IN ('CONFIRMED','DEPOSITED');
```

---

## MenuDAO & DishDAO

### getByRestaurantID(menu)

```sql
SELECT menuID, restaurantID, name, price, imageURL, status FROM menu WHERE restaurantID = ? ORDER BY menuID ASC;
```

### getByID(menuID) with dishes

```sql
-- menu
SELECT menuID, restaurantID, name, price, imageURL, status FROM menu WHERE menuID = ?;
-- dishes via join table dishmenu
SELECT d.dishID, d.name, d.price, d.imageURL
FROM dishmenu dm
JOIN dish d ON d.dishID = dm.dishID
WHERE dm.menuID = ?;
```

### createMenu (with dishIDs)

Transaction example validating dish ownership first:

```sql
START TRANSACTION;
-- validate dishes belong to restaurant
SELECT dishID FROM dish WHERE dishID IN (...) AND restaurantID = ?;
-- insert menu
INSERT INTO menu (restaurantID, name, price, imageURL, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, NOW(), NOW());
SET @menu_id = LAST_INSERT_ID();
-- bulk insert into dishmenu
INSERT INTO dishmenu (menuID, dishID) VALUES (@menu_id, ?), ...;
COMMIT;
```

### DishDAO add/update/delete

```sql
INSERT INTO dish (restaurantID, name, description, price, imageURL) VALUES (?, ?, ?, ?, ?);
UPDATE dish SET name = COALESCE(?, name), description = COALESCE(?, description), price = COALESCE(?, price), imageURL = COALESCE(?, imageURL) WHERE dishID = ?;
DELETE FROM dish WHERE dishID = ?;
```

---

## PromotionDAO

Promotions can be linked to restaurants via `restaurantpromotion` and to services via `promotionservice` (for "Free" service promotions). The DAO's logic performs transactional inserts for new promotions and their links.

### getAll()

```sql
SELECT promotionID, title, description, discountPercentage, discountType, startDate, endDate FROM promotion ORDER BY promotionID ASC;
```

### getByID(promotionID)

```sql
SELECT promotionID, title, description, discountPercentage, discountType, startDate, endDate FROM promotion WHERE promotionID = ?;
```

### getPromotionsByRestaurantID(restaurantID)

Two-step pattern: find promotionIDs from linking table then fetch promotions.

```sql
SELECT promotionID FROM restaurantpromotion WHERE restaurantID = ?;
-- then
SELECT promotionID, title, description, discountPercentage, discountType, startDate, endDate
FROM promotion
WHERE promotionID IN (?);
```

### getServicesByPromotionID(promotionID)

```sql
SELECT serviceID FROM promotionservice WHERE promotionID = ?;
-- then
SELECT serviceID, name, description, price FROM service WHERE serviceID IN (?);
```

### addPromotion(...) — transactional

Insert promotion and optional links to restaurant and services inside a transaction.

```sql
START TRANSACTION;

INSERT INTO promotion (title, description, discountPercentage, startDate, endDate, discountType, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());
SET @promotion_id = LAST_INSERT_ID();

-- link to restaurant if provided
INSERT INTO restaurantpromotion (promotionID, restaurantID) VALUES (@promotion_id, ?);

-- if discountType = 'Free', link services
INSERT INTO promotionservice (promotionID, serviceID) VALUES (@promotion_id, ?), ...;

COMMIT;
```

### updatePromotion(promotionID, promotionData)

```sql
UPDATE promotion SET title = COALESCE(?, title), description = COALESCE(?, description), discountPercentage = COALESCE(?, discountPercentage), discountType = COALESCE(?, discountType), startDate = COALESCE(?, startDate), endDate = COALESCE(?, endDate), updatedAt = NOW() WHERE promotionID = ?;
```

### updateStatus(promotionID, statusData)

```sql
UPDATE promotion SET /* set status fields as appropriate */ updatedAt = NOW() WHERE promotionID = ?;
```

### deletePromotion(promotionID)

```sql
START TRANSACTION;
DELETE FROM promotionservice WHERE promotionID = ?;
DELETE FROM restaurantpromotion WHERE promotionID = ?;
DELETE FROM promotion WHERE promotionID = ?;
COMMIT;
```

### Notes

- Ensure foreign key constraints exist on `restaurantpromotion` and `promotionservice` for referential integrity.
- Index `restaurantpromotion(restaurantID)` and `promotionservice(promotionID)` for fast lookups.

## AmenityDAO & EventTypeDAO

### getAll()

```sql
SELECT amenityID, name, description FROM amenity ORDER BY amenityID ASC;
SELECT eventTypeID, name, description FROM eventtype ORDER BY eventTypeID ASC;
```

### getByID(id)

```sql
SELECT * FROM amenity WHERE amenityID = ?;
SELECT * FROM eventtype WHERE eventTypeID = ?;
```

### getAmenitiesByRestaurantID(restaurantID)

Two-step pattern: find linking rows, then fetch amenities.

```sql
SELECT amenityID FROM restaurantamenities WHERE restaurantID = ?;
-- then
SELECT amenityID, name, description FROM amenity WHERE amenityID IN (...);
```

### getAllByRestaurantID(eventType)

Same pattern as amenities using `restauranteventtype` linking table.

---

## Index & performance notes

- Index `restaurant(addressID)`, `hall(restaurantID)`, `menu(restaurantID)`, `dish(restaurantID)`, `booking(hallID,eventDate,startTime,endTime,status)` to speed searches and availability checks.
- For search, a full-text index on `address.fullAddress` or separate `city/district` columns is recommended.
- Use pagination and LIMIT/OFFSET or keyset paging for listing endpoints.

---

## Transaction notes

- `createRestaurant` must create address + restaurant + images inside a transaction.
- `createMenu` must validate dish ownership and link dishes in one transaction.
- `deleteHall` should check for active bookings first and fail/abort if they exist.

---

If you want, I can now:

- Convert key SQL snippets into Sequelize raw queries or model-based DAO implementations and apply them to `server/src/dao/*` files.
- Generate Sequelize migration files for any missing indexes recommended above.
- Create a small CLI script to run search examples and availability checks against your dev DB.

Which follow-up do you want next?
