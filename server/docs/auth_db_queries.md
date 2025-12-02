# Auth subsystem — Database DDL & example queries

Below are suggested MySQL DDL statements (for Sequelize/MySQL schema) and Mongo shell commands used by `mongoDAO.js` (OTP + blacklist). Put these in your migration files or run them in your DB consoles. Also added common queries that match methods in `userDao.js` and `mongoDAO.js`.

---

## MySQL (users + customer + restaurantpartner)

```sql
-- Users table (note: project uses `userID` as PK column)
CREATE TABLE IF NOT EXISTS `users` (
  `userID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `fullName` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer','owner','admin') NOT NULL DEFAULT 'customer',
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer profile table (1:1 with users)
CREATE TABLE IF NOT EXISTS `customer` (
  `customerID` INT UNSIGNED NOT NULL,
  `partnerName` VARCHAR(255) DEFAULT '',
  `weddingRole` VARCHAR(50) DEFAULT 'other',
  PRIMARY KEY (`customerID`),
  CONSTRAINT `fk_customer_user` FOREIGN KEY (`customerID`) REFERENCES `users` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Restaurant partner table (1:1 with users)
CREATE TABLE IF NOT EXISTS `restaurantpartner` (
  `restaurantPartnerID` INT UNSIGNED NOT NULL,
  `licenseUrl` TEXT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `commissionRate` DECIMAL(5,2) NULL,
  PRIMARY KEY (`restaurantPartnerID`),
  CONSTRAINT `fk_partner_user` FOREIGN KEY (`restaurantPartnerID`) REFERENCES `users` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Useful SQL queries matching `userDao.js` methods

```sql
-- findByEmail / getUserByEmail
SELECT u.*,
       c.partnerName, c.weddingRole,
       rp.licenseUrl, rp.status AS partnerStatus, rp.commissionRate
FROM users u
LEFT JOIN customer c ON c.customerID = u.userID
LEFT JOIN restaurantpartner rp ON rp.restaurantPartnerID = u.userID
WHERE u.email = ?;

-- getUserById
SELECT u.*,
       c.partnerName, c.weddingRole,
       rp.licenseUrl, rp.status AS partnerStatus, rp.commissionRate
FROM users u
LEFT JOIN customer c ON c.customerID = u.userID
LEFT JOIN restaurantpartner rp ON rp.restaurantPartnerID = u.userID
WHERE u.userID = ?;

-- createUser (example parameter order)
INSERT INTO users (email, fullName, phone, password, role, status)
VALUES (?, ?, ?, ?, ?, ?);

-- updatePassword
UPDATE users SET password = ? , updatedAt = CURRENT_TIMESTAMP WHERE userID = ?;
```

---

## MongoDB: OTPs & blacklist (used by `mongoDAO.js`)

These commands are intended for the `mongo` shell or an admin GUI. The app's `mongoDAO.js` expects a DB named `userRestaurantsDB` by default.

```js
// switch to DB
use userRestaurantsDB

// Create TTL index on otps.expiresAt (the code uses expireAfterSeconds: 120)
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 120 });

// Example: insert OTP document (server-side code uses insertOne)
db.otps.insertOne({ email: "alice@example.com", otp: "123456", expiresAt: new Date(Date.now() + 2 * 60 * 1000), createdAt: new Date() });

// Blacklist tokens collection — create index on token for fast lookup
db.blacklist.createIndex({ token: 1 }, { unique: true });

// If you store expiry for blacklisted token, create TTL index (optional)
// db.blacklist.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Mongo queries matching `mongoDAO.js` functions

```js
// insertOtp(email, otp)
db.otps.insertOne({
  email: emailValue,
  otp: otpValue,
  expiresAt: new Date(Date.now() + 120 * 1000),
  createdAt: new Date(),
});

// getOtpByEmail(email)
db.otps.findOne({ email: emailValue });

// deleteOtpByEmail(email)
db.otps.deleteOne({ email: emailValue });

// setBlacklistToken(token, expiry)
db.blacklist.insertOne({ token: tokenValue, expiresAt: expiryDate });

// isTokenBlacklisted(token)
db.blacklist.findOne({ token: tokenValue });
```

---

## Notes / recommendations

- Keep OTPs and blacklist in Mongo as current code does — TTL indexes are simple and robust for ephemeral data.
- Use prepared statements or parameter binding for SQL queries to prevent injection.
- If you want blacklist in SQL instead of Mongo, create a `token_blacklist` table with an indexed `token` column and optional `expiresAt` + TTL cleanup job.

---
