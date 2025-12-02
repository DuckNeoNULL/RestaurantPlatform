# User management — SQL queries

File purpose: quick SQL query snippets (SELECT / INSERT / UPDATE / DELETE / transaction flows) that correspond to the methods in `server/src/dao/userDao.js`.

Note: adapt parameter placeholders to your client (e.g., `?` for prepared statements, `$1` for pg). Use transactions for multi-statement flows.

---

## 1) getAllUsers()

Return users with joined owner/customer profiles.

```sql
SELECT u.*,
       c.partnerName AS customerPartnerName, c.weddingRole,
       rp.licenseUrl, rp.status AS partnerStatus, rp.commissionRate
FROM users u
LEFT JOIN customer c ON c.customerID = u.userID
LEFT JOIN restaurantpartner rp ON rp.restaurantPartnerID = u.userID
ORDER BY u.createdAt DESC;
```

---

## 2) getUserById(id)

Return a single user by ID with related profiles.

```sql
SELECT u.*,
       c.partnerName AS customerPartnerName, c.weddingRole,
       rp.licenseUrl, rp.status AS partnerStatus, rp.commissionRate
FROM users u
LEFT JOIN customer c ON c.customerID = u.userID
LEFT JOIN restaurantpartner rp ON rp.restaurantPartnerID = u.userID
WHERE u.userID = ?;
```

---

## 3) findByEmail(email)

Find a user by email (used in Auth flows / signups).

```sql
SELECT u.*,
       c.partnerName AS customerPartnerName, c.weddingRole,
       rp.licenseUrl, rp.status AS partnerStatus, rp.commissionRate
FROM users u
LEFT JOIN customer c ON c.customerID = u.userID
LEFT JOIN restaurantpartner rp ON rp.restaurantPartnerID = u.userID
WHERE u.email = ?
LIMIT 1;
```

---

## 4) createOwner(data) — transactional flow

Insert user row then insert partner profile (run inside a transaction). Example using generic SQL / pseudo-MySQL syntax:

```sql
START TRANSACTION;

INSERT INTO users (email, fullName, phone, password, role, status, createdAt, updatedAt)
VALUES (?, ?, ?, ?, 'owner', 1, NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO restaurantpartner (restaurantPartnerID, licenseUrl, status, commissionRate)
VALUES (@user_id, ?, 'pending', NULL);

COMMIT;
```

Parameters: email, fullName, phone, hashedPassword, licenseUrl

---

## 5) createCustomer(data) — transactional flow

Insert user then insert customer profile.

```sql
START TRANSACTION;

INSERT INTO users (email, fullName, phone, password, role, status, createdAt, updatedAt)
VALUES (?, ?, ?, ?, 'customer', 1, NOW(), NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO customer (customerID, partnerName, weddingRole)
VALUES (@user_id, ?, ?);

COMMIT;
```

Parameters: email, fullName, phone, hashedPassword, partnerName, weddingRole

---

## 6) updateStatusUser(id, status)

Toggle user active/inactive. In `userDao.js` the code maps numeric 1/0 to boolean. Use prepared param.

```sql
-- set status boolean/int according to your schema (1 active, 0 inactive)
UPDATE users
SET status = ?, updatedAt = NOW()
WHERE userID = ?;
```

Return/Check: affected rows count to verify update succeeded.

---

## 7) updateUserInfo(id, updates)

This method in DAO updates user fields and upserts the owner/customer profile depending on `role`.
Below are example queries you can use (application should choose which to run depending on `role` and presence of related rows).

A) Update base user fields

```sql
UPDATE users
SET fullName = COALESCE(?, fullName),
    phone = COALESCE(?, phone),
    password = COALESCE(?, password),
    role = COALESCE(?, role),
    status = CASE WHEN ? IS NULL THEN status WHEN ? = 1 THEN 1 ELSE 0 END,
    updatedAt = NOW()
WHERE userID = ?;
```

Parameters mapping example: (fullName, phone, password, role, statusFlag, statusFlag, userId)

B) Upsert restaurantpartner (owner side)
MySQL 8 / MariaDB can use INSERT ... ON DUPLICATE KEY UPDATE if `restaurantPartnerID` is PK:

```sql
INSERT INTO restaurantpartner (restaurantPartnerID, licenseUrl, status, commissionRate)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  licenseUrl = VALUES(licenseUrl),
  status = VALUES(status),
  commissionRate = VALUES(commissionRate);
```

Alternatively, check existence and UPDATE or INSERT separately:

```sql
SELECT 1 FROM restaurantpartner WHERE restaurantPartnerID = ? LIMIT 1;
-- if exists then
UPDATE restaurantpartner
SET licenseUrl = COALESCE(?, licenseUrl),
    status = COALESCE(?, status),
    commissionRate = COALESCE(?, commissionRate)
WHERE restaurantPartnerID = ?;
-- else
INSERT INTO restaurantpartner (restaurantPartnerID, licenseUrl, status, commissionRate)
VALUES (?, ?, ?, ?);
```

C) Upsert customer (customer side)
Same pattern as restaurantpartner:

```sql
INSERT INTO customer (customerID, partnerName, weddingRole)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE
  partnerName = VALUES(partnerName),
  weddingRole = VALUES(weddingRole);
```

Or SELECT then UPDATE/INSERT as needed.

Note: Wrap these in a transaction when the DAO's updateUserInfo executes multiple statements.

---

## 8) deleteUser(id)

This DAO deletes related partner/customer rows then the user row. Use transaction to ensure consistency.

```sql
START TRANSACTION;

DELETE FROM restaurantpartner WHERE restaurantPartnerID = ?;
DELETE FROM customer WHERE customerID = ?;
DELETE FROM users WHERE userID = ?;

COMMIT;
```

Check affected rows of the final DELETE to know whether the user existed.

---

## 9) getCustomers() and getOwners()

Return lists filtered by role (optionally join profile data):

```sql
-- customers
SELECT u.*, c.partnerName, c.weddingRole
FROM users u
LEFT JOIN customer c ON c.customerID = u.userID
WHERE u.role = 'customer'
ORDER BY u.createdAt DESC;

-- owners
SELECT u.*, rp.licenseUrl, rp.status AS partnerStatus, rp.commissionRate
FROM users u
LEFT JOIN restaurantpartner rp ON rp.restaurantPartnerID = u.userID
WHERE u.role = 'owner'
ORDER BY u.createdAt DESC;
```

---

## 10) Useful admin queries

- Count users by role:

```sql
SELECT role, COUNT(*) AS cnt FROM users GROUP BY role;
```

- Find users with missing profile (owner without restaurantpartner or customer without customer row):

```sql
-- owners missing partner record
SELECT u.* FROM users u
LEFT JOIN restaurantpartner rp ON rp.restaurantPartnerID = u.userID
WHERE u.role = 'owner' AND rp.restaurantPartnerID IS NULL;

-- customers missing customer record
SELECT u.* FROM users u
LEFT JOIN customer c ON c.customerID = u.userID
WHERE u.role = 'customer' AND c.customerID IS NULL;
```

- Find by phone or email (search):

```sql
SELECT * FROM users WHERE email LIKE CONCAT('%', ?, '%') OR phone LIKE CONCAT('%', ?, '%') ORDER BY createdAt DESC LIMIT 100;
```

---

## Notes / recommendations

- Always parameterize (prepared statements) to avoid SQL injection.
- Use transactions where multiple statements must be atomic (createOwner/createCustomer, updateUserInfo, deleteUser).
- Prefer `INSERT ... ON DUPLICATE KEY UPDATE` for upserts when supported by your MySQL version and when the unique/PK constraints match.
- Keep password hashing to application code (store hashed password), never in SQL.

---

If you want, tôi có thể:

- Tạo file migration (Sequelize) that implements the `users`, `customer`, `restaurantpartner` tables used here.
- Convert the SQL snippets into Sequelize DAO snippets (matching `UserDAO` methods) and add them to `server/src/dao/` as examples.
- Add sample prepared-statement code for your server's DB client (e.g., mysql2, sequelize raw queries).

Chọn việc tiếp theo bạn muốn tôi làm.
