# Booking subsystem — Database DDL & example queries

This file contains suggested MySQL DDL for booking-related tables and example SQL (and short Sequelize notes) that map to the `BookingDAO` operations in the codebase.

Use these in migrations or to seed your dev DB. All monetary columns use DECIMAL(12,2) to avoid floating-point issues.

---

## DDL — MySQL (bookings + items + services + promotions + payments)

```sql
-- bookings table
CREATE TABLE IF NOT EXISTS `bookings` (
  `bookingID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customerID` INT UNSIGNED NOT NULL,
  `hallID` INT UNSIGNED NOT NULL,
  `menuID` INT UNSIGNED DEFAULT NULL,
  `eventDate` DATE NOT NULL,
  `startTime` TIME NOT NULL,
  `endTime` TIME NOT NULL,
  `tableCount` INT UNSIGNED NOT NULL DEFAULT 0,
  `originalPrice` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discountAmount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `VAT` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `totalAmount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PENDING','ACCEPTED','REJECTED','CONFIRMED','DEPOSITED','EXPIRED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `isChecked` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bookingID`),
  KEY `idx_booking_hall_event` (`hallID`,`eventDate`,`startTime`,`endTime`),
  KEY `idx_booking_customer_date` (`customerID`,`eventDate`),
  KEY `idx_booking_confirm` (`status`,`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- booking_dishes (items selected from menu)
CREATE TABLE IF NOT EXISTS `booking_dishes` (
  `bookingDishID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bookingID` INT UNSIGNED NOT NULL,
  `dishID` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unitPrice` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`bookingDishID`),
  KEY (`bookingID`),
  CONSTRAINT `fk_booking_dish_booking` FOREIGN KEY (`bookingID`) REFERENCES `bookings`(`bookingID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- booking_services (paid services like extra chairs, sound, etc.)
CREATE TABLE IF NOT EXISTS `booking_services` (
  `bookingServiceID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bookingID` INT UNSIGNED NOT NULL,
  `serviceID` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`bookingServiceID`),
  KEY (`bookingID`),
  CONSTRAINT `fk_booking_service_booking` FOREIGN KEY (`bookingID`) REFERENCES `bookings`(`bookingID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- booking_promotions
CREATE TABLE IF NOT EXISTS `booking_promotions` (
  `bookingPromotionID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bookingID` INT UNSIGNED NOT NULL,
  `promotionCode` VARCHAR(100) NOT NULL,
  `discountAmount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `appliedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bookingPromotionID`),
  KEY (`bookingID`),
  CONSTRAINT `fk_booking_promotion_booking` FOREIGN KEY (`bookingID`) REFERENCES `bookings`(`bookingID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- booking_payments
CREATE TABLE IF NOT EXISTS `booking_payments` (
  `paymentID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bookingID` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `method` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'PENDING',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`paymentID`),
  KEY (`bookingID`),
  CONSTRAINT `fk_booking_payment_booking` FOREIGN KEY (`bookingID`) REFERENCES `bookings`(`bookingID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Notes on indexes

- `idx_booking_confirm (status, createdAt)` speeds up queries that find CONFIRMED bookings older than a cutoff for bulk expiration.
- `idx_booking_hall_event` supports hall/time overlap checks.
- `idx_booking_customer_date` helps check per-customer same-day limits.

---

## Example SQL queries mapped to `BookingDAO` methods

### createBooking(bookingData, opts)

Recommended pattern: use a DB transaction. Insert `bookings` then insert related rows (`booking_dishes`, `booking_services`, `booking_promotions`, optional `booking_payments`). Example SQL flow:

```sql
START TRANSACTION;

INSERT INTO bookings
  (customerID, hallID, menuID, eventDate, startTime, endTime, tableCount, originalPrice, discountAmount, VAT, totalAmount, status, isChecked)
VALUES
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0);

-- get new booking id (in MySQL):
SET @booking_id = LAST_INSERT_ID();

-- insert dishes (repeat per dish)
INSERT INTO booking_dishes (bookingID, dishID, quantity, unitPrice) VALUES (@booking_id, ?, ?, ?);

-- insert services (repeat per service)
INSERT INTO booking_services (bookingID, serviceID, quantity, price) VALUES (@booking_id, ?, ?, ?);

-- insert promotions if any
INSERT INTO booking_promotions (bookingID, promotionCode, discountAmount) VALUES (@booking_id, ?, ?);

COMMIT;
```

Sequelize short example (pseudo):

```js
await sequelize.transaction(async (t) => {
  const booking = await BookingModel.create(bookingData, { transaction: t });
  const bookingId = booking.bookingID;
  await BookingDishModel.bulkCreate(
    dishes.map((d) => ({ bookingID: bookingId, ...d })),
    { transaction: t }
  );
  // services, promotions ...
});
```

---

### getBookingById(bookingID)

Simple select from bookings:

```sql
SELECT * FROM bookings WHERE bookingID = ?;
```

### getBookingDetails(bookingID)

Join booking with dishes/services/payments and optional customer/hall/menu:

```sql
SELECT b.*, c.fullName AS customerName, h.name AS hallName, m.name AS menuName
FROM bookings b
LEFT JOIN users c ON c.userID = b.customerID
LEFT JOIN halls h ON h.hallID = b.hallID
LEFT JOIN menus m ON m.menuID = b.menuID
WHERE b.bookingID = ?;

-- To get line items:
SELECT * FROM booking_dishes WHERE bookingID = ?;
SELECT * FROM booking_services WHERE bookingID = ?;
SELECT * FROM booking_promotions WHERE bookingID = ?;
SELECT * FROM booking_payments WHERE bookingID = ?;
```

(If you prefer one query, aggregate line items as JSON using MySQL JSON functions or do multiple queries inside the DAO.)

---

### findByHallAndTime(hallID, eventDate, startTime, endTime)

Find bookings that overlap with the supplied interval. This uses the standard overlap condition:

```sql
SELECT * FROM bookings
WHERE hallID = ?
  AND eventDate = ?
  AND NOT (endTime <= ? OR startTime >= ?)
  AND status IN ('PENDING','ACCEPTED','CONFIRMED','DEPOSITED');
```

Notes:

- Use `FOR UPDATE` inside a transaction if calling this to reserve/lock the hall before inserting a booking.
- Consider rounding/truncation of times in your comparisons depending on how times are stored.

---

### findByCustomerAndDate(customerID, eventDate)

Check if a customer already has bookings the same day (enforce per-customer limit):

```sql
SELECT * FROM bookings
WHERE customerID = ?
  AND eventDate = ?
  AND status NOT IN ('REJECTED','EXPIRED','CANCELLED');
```

---

### updateBookingStatusWithTransaction(bookingID, newStatus, transaction)

Pattern: inside a transaction, lock the booking row, verify allowed transition, then update.

```sql
-- Example single statement
SELECT * FROM bookings WHERE bookingID = ? FOR UPDATE;
-- verify current status in application code
UPDATE bookings SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE bookingID = ?;
```

Sequelize example (pseudo):

```js
await sequelize.transaction(async (t) => {
  const booking = await BookingModel.findByPk(bookingID, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  // validate transition
  await booking.update({ status: newStatus }, { transaction: t });
  // register afterCommit hooks in service to send notifications
});
```

---

### expireByIds(ids, setChecked)

Mark explicit booking IDs as EXPIRED (used by cron). Use a WHERE filter to avoid changing bookings that are not CONFIRMED.

```sql
UPDATE bookings
SET status = 'EXPIRED', isChecked = ?, updatedAt = CURRENT_TIMESTAMP
WHERE bookingID IN (<ids...>)
  AND status = 'CONFIRMED';
```

Pass `setChecked` as 1 to mark checked; otherwise 0.

---

### bulkExpireConfirmedOlderThanBatch(cutoff, batchSize)

Pattern used by cron: select a batch of booking IDs to expire, then update them.

```sql
-- step 1: pick a batch using the index (status, createdAt)
SELECT bookingID
FROM bookings
WHERE status = 'CONFIRMED'
  AND createdAt < ? -- cutoff datetime
ORDER BY createdAt
LIMIT ?;

-- step 2: expire by ids (see expireByIds)
UPDATE bookings
SET status = 'EXPIRED', isChecked = 1, updatedAt = CURRENT_TIMESTAMP
WHERE bookingID IN (<ids from step1>)
  AND status = 'CONFIRMED';
```

Use the composite index `idx_booking_confirm (status, createdAt)` to make step 1 fast and avoid full table scans.

---

## Helpful admin queries

- Find all bookings to expire (preview):

```sql
SELECT bookingID, customerID, createdAt FROM bookings
WHERE status = 'CONFIRMED' AND createdAt < DATE_SUB(NOW(), INTERVAL 2 DAY)
ORDER BY createdAt LIMIT 100;
```

- Count bookings by status:

```sql
SELECT status, COUNT(*) as cnt FROM bookings GROUP BY status;
```

- Paginated listing (with optional filter):

```sql
SELECT * FROM bookings
WHERE (? IS NULL OR hallID = ?)
ORDER BY createdAt DESC
LIMIT ? OFFSET ?;
```

---

## Operational notes / recommendations

- Always perform createBooking and status transitions within a transaction. Use row-level locks (`SELECT ... FOR UPDATE`) when checking+writing status to avoid races.
- Use the `idx_booking_confirm (status, createdAt)` index for expiration queries run by cron (this avoids scanning the whole bookings table).
- When expiring in batches, prefer selecting IDs then updating by IDs in a second statement to keep locks short.
- Store monetary values in `DECIMAL(12,2)` and compute VAT/discounts in application logic using integer cents or decimal libraries to avoid rounding surprises.
- Parameterize queries to avoid SQL injection; when using an ORM (Sequelize) prefer the transaction API and `lock: t.LOCK.UPDATE`.

---

## Optional: Sequelize migration snippet (example)

If you use Sequelize migrations, the bookings table definition above maps to a migration file similar to:

```js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bookings", {
      bookingID: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      customerID: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      hallID: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      // ...other fields
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("bookings", ["status", "createdAt"], {
      name: "idx_booking_confirm",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("bookings");
  },
};
```

---

If you'd like, I can also:

- Produce Sequelize migration files for the tables above (one migration per table),
- Create a simple Node script that runs the `idx_booking_confirm` index creation and verifies it,
- Or add example DAO queries implemented as Sequelize model snippets mirroring `BookingDAO`.

Tell me which of these follow-ups you want next and I'll create them.
