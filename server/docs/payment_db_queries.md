# Payment & Payout — SQL snippets (no DDL)

This document contains SQL examples that map to methods in `PaymentDAO` and `PayoutsDAO` in `server/src/dao`. Use `?` placeholders for parameters. These are written for MySQL (compatible with Sequelize raw queries).

---

## PaymentDAO

### getByBookingID(bookingID)

Return all payments for a booking ordered by paymentID.

```sql
SELECT paymentID, bookingID, restaurantID, amount, type, paymentMethod, status, transactionRef, paymentDate, refundedAmount, providerResponse
FROM payment
WHERE bookingID = ?
ORDER BY paymentID ASC;
```

### getByRestaurantID(restaurantID)

```sql
SELECT paymentID, bookingID, restaurantID, amount, type, paymentMethod, status, transactionRef, paymentDate
FROM payment
WHERE restaurantID = ?
ORDER BY paymentDate DESC;
```

### getByTransactionRef(transactionRef)

```sql
SELECT * FROM payment WHERE transactionRef = ? LIMIT 1;
```

### createPayment(data)

Typical insert. Use a transaction if creating related records (e.g., linking to booking or payouts).

```sql
INSERT INTO payment (bookingID, restaurantID, amount, type, paymentMethod, status, transactionRef, paymentDate, released, refundedAmount, refundReason, providerResponse, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());

-- return LAST_INSERT_ID() as paymentID
```

### updatePaymentStatus(paymentID, newStatus)

```sql
UPDATE payment
SET status = ?, updatedAt = NOW()
WHERE paymentID = ?;
```

### markReleased(paymentID, { released, providerResponse })

```sql
UPDATE payment
SET released = ?, providerResponse = ?, updatedAt = NOW()
WHERE paymentID = ?;
```

### refundPayment(paymentID, { amount, refundTransactionRef, refundReason })

This should be implemented in a transaction and use SELECT ... FOR UPDATE to prevent race conditions.

```sql
START TRANSACTION;

-- lock row
SELECT amount, refundedAmount FROM payment WHERE paymentID = ? FOR UPDATE;

-- validate in application code: alreadyRefunded + amount <= originalAmount

UPDATE payment
SET refundedAmount = refundedAmount + ?,
    refundDate = NOW(),
    refundTransactionRef = ?,
    refundReason = ?,
    status = CASE WHEN refundedAmount + ? >= amount THEN 'REFUNDED' ELSE status END,
    updatedAt = NOW()
WHERE paymentID = ?;

COMMIT;
```

### getPaymentsByStatus(statusList)

```sql
SELECT * FROM payment WHERE status IN (?);
```

---

## PayoutsDAO

### getByRestaurantPartnerID(restaurantPartnerId)

```sql
SELECT payoutId, paymentId, restaurantPartnerId, grossAmount, commissionAmount, payoutAmount, method, status, transactionRef, note, releasedBy, releasedAt, createdAt
FROM payouts
WHERE restaurantPartnerId = ?
ORDER BY createdAt DESC;
```

### getByPaymentID(paymentId)

```sql
SELECT * FROM payouts WHERE paymentId = ? ORDER BY payoutId ASC;
```

### getByTransactionRef(transactionRef)

```sql
SELECT * FROM payouts WHERE transactionRef = ? LIMIT 1;
```

### createPayout(data)

Create a payout record. Typically called inside a transaction if you also update payment/release flags.

```sql
INSERT INTO payouts (paymentId, restaurantPartnerId, grossAmount, commissionAmount, payoutAmount, method, status, transactionRef, note, releasedBy, releasedAt, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
-- return LAST_INSERT_ID() as payoutId
```

If you need to atomically mark the payment as released and create a payout record, do both inside one transaction:

```sql
START TRANSACTION;

UPDATE payment SET released = 1, updatedAt = NOW() WHERE paymentID = ?;

INSERT INTO payouts (paymentId, restaurantPartnerId, grossAmount, commissionAmount, payoutAmount, method, status, transactionRef, note, releasedBy, releasedAt, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());

COMMIT;
```

### updatePayoutStatus(payoutId, newStatus)

```sql
UPDATE payouts SET status = ?, updatedAt = NOW() WHERE payoutId = ?;
```

### markReleased(payoutId, { releasedBy, releasedAt, status, transactionRef })

```sql
UPDATE payouts
SET releasedBy = COALESCE(?, releasedBy),
    releasedAt = COALESCE(?, releasedAt),
    status = COALESCE(?, status),
    transactionRef = COALESCE(?, transactionRef),
    updatedAt = NOW()
WHERE payoutId = ?;
```

### getPayoutsByStatus(statusList)

```sql
SELECT * FROM payouts WHERE status IN (?) ORDER BY createdAt DESC;
```

### getPendingPayouts()

```sql
SELECT * FROM payouts WHERE status = ? ORDER BY createdAt ASC; -- use PENDING value
```

---

## Index and performance recommendations

- Index `payment(bookingID)`, `payment(restaurantID)`, `payment(transactionRef)`, `payment(status)`.
- Index `payouts(restaurantPartnerId)`, `payouts(paymentId)`, `payouts(status)`, `payouts(transactionRef)`.
- Use `SELECT ... FOR UPDATE` in transactional flows that read/update financial numbers (refunds, releasing funds) to prevent race conditions.

## Notes and mapping to Sequelize

- The DAO methods can use model methods (findAll/findOne/create/update) but for complex transactional flows use `sequelize.transaction(async (t) => { ... })` and pass `{ transaction: t }` to model calls.
- For `refundPayment` and `createPayout` combined flows, prefer row locking with `findByPk(..., { transaction: t, lock: t.LOCK.UPDATE })` before updating.
- When doing batch processing of pending payouts, be careful with long-running transactions — fetch IDs first then process each payout in its own short transaction to mark status and attach provider result.

If you'd like, I can also:

- Convert these snippets into Sequelize-based DAO implementations and apply them to `server/src/dao/PaymentDAO.js` and `server/src/dao/PayoutsDAO.js`.
- Add migration files to create the recommended indexes.
- Create a small script to run refunds and payouts safely against a development DB.
