CREATE DATABASE IF NOT EXISTS WeddingRestaurantManagement
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE WeddingRestaurantManagement;

-- Table User
CREATE TABLE User (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatarURL VARCHAR(255) DEFAULT NULL,
    role TINYINT UNSIGNED NOT NULL, -- 0: CUSTOMER, 1: RESTAURANT_PARTNER, 2: ADMIN
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status BIT DEFAULT 1 -- 0: INACTIVE, 1: ACTIVE
);

-- Table Customer
CREATE TABLE Customer (
    customerID INT PRIMARY KEY,
    weddingRole TINYINT UNSIGNED NOT NULL, -- 0: BRIDE, 1: GROOM, 2: OTHER
    partnerName VARCHAR(255),
    FOREIGN KEY (customerID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table RestaurantPartner
CREATE TABLE RestaurantPartner (
    restaurantPartnerID INT PRIMARY KEY,
    licenseUrl VARCHAR(255) NOT NULL,
    status TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 0: PENDING, 1: REJECTED, 2: NEGOTIATING, 3: ACTIVE, 4: INACTIVE
	commissionRate DECIMAL(3,2) DEFAULT NULL CHECK (commissionRate >= 0 AND commissionRate <= 1),
    FOREIGN KEY (restaurantPartnerID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table Address
CREATE TABLE Address (
    addressID INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(10) NOT NULL,
    street VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    fullAddress VARCHAR(255) AS (CONCAT(number, ' ', street, ', ', ward)) STORED
);

-- Table Restaurant
CREATE TABLE Restaurant (
    restaurantID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantPartnerID INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    description VARCHAR(255),
    hallCount INT DEFAULT 0,
    addressID INT NOT NULL,
    thumbnailURL VARCHAR(255) NOT NULL,
    avgRating DECIMAL(2,1) DEFAULT 0,
    totalReviews INT DEFAULT 0,
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE
    FOREIGN KEY (restaurantPartnerID) REFERENCES RestaurantPartner(restaurantPartnerID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (addressID) REFERENCES Address(addressID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table RestaurantImage
CREATE TABLE RestaurantImage (
    imageID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    imageURL VARCHAR(255) NOT NULL,
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table BankAccount
CREATE TABLE BankAccount (
    accountID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantPartnerID INT NOT NULL,
    bankName VARCHAR(255) NOT NULL,
    accountNumber VARCHAR(255) NOT NULL,
    accountHolder VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE
    FOREIGN KEY (restaurantPartnerID) REFERENCES RestaurantPartner(restaurantPartnerID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table Amenity
CREATE TABLE Amenity (
    amenityID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status BIT DEFAULT 1 -- 0: INACTIVE, 1: ACTIVE
);

-- Table RestaurantAmenities
CREATE TABLE RestaurantAmenities (
    restaurantID INT NOT NULL,
    amenityID INT NOT NULL,
    PRIMARY KEY (restaurantID, amenityID),
	FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (amenityID) REFERENCES Amenity(amenityID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table Hall
CREATE TABLE Hall (
    hallID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
	minTable INT CHECK (minTable >= 0),
    maxTable INT CHECK (maxTable > 0),
    CHECK (minTable <= maxTable),
    area DECIMAL(7,2) NOT NULL CHECK (area > 0),
    price DECIMAL(15,2) NOT NULL CHECK (price >= 0),
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table HallImage
CREATE TABLE HallImage (
    imageID INT AUTO_INCREMENT PRIMARY KEY,
    hallID INT NOT NULL,
    imageURL VARCHAR(255) NOT NULL,
    FOREIGN KEY (hallID) REFERENCES Hall(hallID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table Menu
CREATE TABLE Menu (
    menuID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    imageURL VARCHAR(255),
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table DishCategory
CREATE TABLE DishCategory (
    categoryID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    requiredQuantity INT DEFAULT 1 CHECK(requiredQuantity > 0),
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table Dish
CREATE TABLE Dish (
    dishID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    categoryID INT NOT NULL,
    imageURL VARCHAR(255),
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE
    FOREIGN KEY (categoryID) REFERENCES DishCategory(categoryID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table DishMenu (many-to-many)
CREATE TABLE DishMenu (
    menuID INT NOT NULL,
    dishID INT NOT NULL,
    PRIMARY KEY (menuID, dishID),
    FOREIGN KEY (menuID) REFERENCES Menu(menuID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (dishID) REFERENCES Dish(dishID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table EventType
CREATE TABLE EventType (
    eventTypeID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status BIT NOT NULL DEFAULT 1
);

-- Table RestaurantEventType (many-to-many)
CREATE TABLE RestaurantEventType (
    restaurantID INT NOT NULL,
    eventTypeID INT NOT NULL,
    PRIMARY KEY (restaurantID, eventTypeID),

    CONSTRAINT FK_RestaurantEventType_Restaurant
        FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT FK_RestaurantEventType_EventType
        FOREIGN KEY (eventTypeID) REFERENCES EventType(eventTypeID)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table Service
CREATE TABLE Service (
    serviceID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    eventTypeID INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    unit VARCHAR(50),
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (eventTypeID) REFERENCES EventType(eventTypeID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table Promotion
CREATE TABLE Promotion (
    promotionID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    minTable INT DEFAULT 0 CHECK(minTable >= 0),
    discountType TINYINT NOT NULL,  -- 0: PERCENT, 1: FREE
    discountValue DECIMAL(15,2) CHECK(discountValue >= 0),
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    status BIT DEFAULT 1, -- 0: INACTIVE, 1: ACTIVE
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    CHECK (startDate <= endDate)
);

-- Table PromotionService (many-to-many)
CREATE TABLE PromotionService (
    promotionID INT NOT NULL,
    serviceID INT NOT NULL,
    PRIMARY KEY (promotionID, serviceID),
    FOREIGN KEY (promotionID) REFERENCES Promotion(promotionID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (serviceID) REFERENCES Service(serviceID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table Booking
CREATE TABLE Booking (
    bookingID INT AUTO_INCREMENT PRIMARY KEY,
    customerID INT NOT NULL,
    eventTypeID INT NOT NULL,
    hallID INT NOT NULL,
    menuID INT NOT NULL,
    eventDate DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    tableCount INT DEFAULT 1 CHECK(tableCount > 0),
    specialRequest VARCHAR(255),
    status TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 0: PENDING, 1: ACCEPTED, 2: REJECTED, 3: CONFIRMED, 4: DEPOSITED, 5: EXPIRED, 6: CANCELLED, 7: COMPLETED
    originalPrice DECIMAL(15,2) NOT NULL,
    discountAmount DECIMAL(15,2) DEFAULT 0,
    VAT DECIMAL(15,2) NOT NULL,
    totalAmount DECIMAL(15,2) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    isChecked BIT DEFAULT 0, -- 0: UNCHECKED, 1: CHECKED
    FOREIGN KEY (customerID) REFERENCES Customer(customerID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (eventTypeID) REFERENCES EventType(eventTypeID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (hallID) REFERENCES Hall(hallID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (menuID) REFERENCES Menu(menuID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table BookingDish
CREATE TABLE BookingDish (
    bookingID INT NOT NULL,
    dishID INT NOT NULL,
    PRIMARY KEY (bookingID, dishID),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID) ON DELETE CASCADE,
    FOREIGN KEY (dishID) REFERENCES Dish(dishID) ON DELETE CASCADE
);

-- Table BookingService
CREATE TABLE BookingService (
    bookingID INT NOT NULL,
    serviceID INT NOT NULL,
    quantity INT DEFAULT 1 CHECK(quantity > 0),
    appliedPrice DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (bookingID, serviceID),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID) ON DELETE CASCADE,
    FOREIGN KEY (serviceID) REFERENCES Service(serviceID) ON DELETE CASCADE
);

-- Table BookingPromotion
CREATE TABLE BookingPromotion (
    bookingID INT NOT NULL,
    promotionID INT NOT NULL,
    PRIMARY KEY (bookingID, promotionID),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID) ON DELETE CASCADE,
    FOREIGN KEY (promotionID) REFERENCES Promotion(promotionID) ON DELETE CASCADE
);

-- Table Payment
CREATE TABLE Payment (
    paymentID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT NOT NULL,
    restaurantID INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK(amount >= 0),
    type TINYINT UNSIGNED DEFAULT 0, -- 0: DEPOSIT, 1: REMAINING, 2: REFUND
    paymentMethod TINYINT UNSIGNED DEFAULT 0, -- 0: PAYOS, 1: BANK_TRANSFER, 2: CARD, 3: CASH
    status TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 0: PENDING, 1: PROCESSING, 2: SUCCESS, 3: FAILED, 4: REFUNDED, 5: CANCELLED
    transactionRef VARCHAR(255) UNIQUE,
    paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    released bit DEFAULT 0,
    refundedAmount DECIMAL(15,2) DEFAULT 0 CHECK (refundedAmount >= 0), -- Tiền đã hoàn lại (nếu có)
    refundReason VARCHAR(255) DEFAULT NULL, -- Lý do hoàn tiền
    refundDate DATETIME DEFAULT NULL, -- Ngày hoàn tiền
    refundTransactionRef VARCHAR(255) UNIQUE,
    providerResponse TEXT, -- Log hoặc JSON phản hồi từ PayOS
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID) ON DELETE CASCADE,
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON DELETE CASCADE
);

CREATE TABLE RefundPolicy (
    policyId  INT AUTO_INCREMENT PRIMARY KEY,
    restaurantId INT NOT NULL,          -- Mỗi nhà hàng có thể có nhiều mốc refund
    daysBeforeEvent INT NOT NULL,             -- Số ngày trước tiệc
    refundPercent DECIMAL(5,2) NOT NULL,    -- % được hoàn (VD: 100.00, 50.00, 0.00)
    description VARCHAR(255),             -- Diễn giải (VD: "Hủy trước 7 ngày hoàn toàn bộ")
    isDefault BOOLEAN DEFAULT FALSE,    -- Dùng nếu muốn set 1 chính sách mặc định
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurantId) REFERENCES Restaurant(restaurantId)
);

-- Table Payouts
CREATE TABLE Payouts (
    payoutId INT AUTO_INCREMENT PRIMARY KEY,
    paymentId INT NOT NULL,
    restaurantPartnerId INT NOT NULL,

    grossAmount DECIMAL(15,2) NOT NULL CHECK (grossAmount >= 0),
    commissionAmount DECIMAL(15,2) NOT NULL CHECK (commissionAmount >= 0),
    payoutAmount DECIMAL(15,2) NOT NULL CHECK (payoutAmount >= 0),

    method TINYINT UNSIGNED NOT NULL DEFAULT 0,   -- 0: PAYOS, 1: BANK_TRANSFER, 2: CARD, 3: CASH
    status TINYINT UNSIGNED NOT NULL DEFAULT 0,   -- 0: PENDING, 1: PROCESSING, 2: SUCCESS, 3: FAILED, 4: CANCELLED

    transactionRef VARCHAR(255) UNIQUE,
    note VARCHAR(255),

    releasedBy INT,
    releasedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payout_payment FOREIGN KEY (paymentId)
        REFERENCES Payment(paymentID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_payout_restaurantPartner FOREIGN KEY (restaurantPartnerId)
        REFERENCES RestaurantPartner(restaurantPartnerID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_payout_releasedBy FOREIGN KEY (releasedBy)
        REFERENCES User(userID)
        ON DELETE SET NULL ON UPDATE CASCADE
);


-- Table Contract
CREATE TABLE Contract (
    contractID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    isActive BOOLEAN DEFAULT TRUE,
    fileOriginalUrl VARCHAR(255),
    filePartnerSignedUrl VARCHAR(255),
    fileCustomerSignedUrl VARCHAR(255),
    partnerSignedAt DATETIME NULL,
    customerSignedAt DATETIME NULL,
    status TINYINT UNSIGNED NOT NULL DEFAULT 0,
    -- 0: PENDING           (vừa generate)
    -- 1: PARTNER_UPLOADED  (partner đã upload bản ký)
    -- 2: CUSTOMER_UPLOADED (customer đã upload bản ký → hoàn tất)
    -- 3: CANCELLED         (hủy)
    -- 4: SUPERSEDED        (bị thay thế)
    note VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID) ON DELETE CASCADE
);

-- Table Review
CREATE TABLE Review (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT NOT NULL,
    customerID INT NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID) ON DELETE CASCADE,
    FOREIGN KEY (customerID) REFERENCES Customer(customerID) ON DELETE CASCADE,
    UNIQUE (bookingID, customerID)
);

-- Table Report
CREATE TABLE Report (
    reportID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,                  -- người gửi report
    restaurantID INT NULL,                -- có thể NULL nếu target là review
    reviewID INT NULL,

    targetType TINYINT UNSIGNED NOT NULL,          -- 0: RESTAURANT, 1: REVIEW
    reasonType TINYINT UNSIGNED NOT NULL,          -- mã lý do, khác nhau theo loại

    content VARCHAR(255),
    status TINYINT NOT NULL DEFAULT 0,    -- 0: PENDING, 1: CONFIRMED, 2: REJECTED
    seen BIT DEFAULT 0,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE,
    FOREIGN KEY (restaurantID) REFERENCES Restaurant(restaurantID) ON DELETE CASCADE,
    FOREIGN KEY (reviewID) REFERENCES Review(reviewID) ON DELETE SET NULL
);

-- Table SystemSetting
CREATE TABLE SystemSetting (
    settingID INT AUTO_INCREMENT PRIMARY KEY,
    category TINYINT UNSIGNED NOT NULL,         -- 0: General, 1: Booking, 2: Payment, 3: Commission, 4: Notification, ...
    settingKey VARCHAR(100) NOT NULL UNIQUE, -- Mã key duy nhất, vd: 'DEFAULT_COMMISSION_RATE', 'REFUND_POLICY_DAYS'
    settingName VARCHAR(255) NOT NULL,      -- Tên hiển thị (vd: "Tỷ lệ hoa hồng mặc định")
    settingValue VARCHAR(255) NOT NULL,     -- Giá trị lưu (string để dễ parse kiểu)
    dataType TINYINT UNSIGNED NOT NULL DEFAULT 0, 	-- 0: STRING, 1: NUMBER, 2: BOOLEAN, 3: JSON, 4: DATE,...
    description VARCHAR(500),               -- Mô tả setting
    isActive BIT DEFAULT 1,                 -- Cho phép bật/tắt setting
    createdBy INT,
    updatedBy INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_systemsetting_createdBy FOREIGN KEY (createdBy)
        REFERENCES User(userID) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_systemsetting_updatedBy FOREIGN KEY (updatedBy)
        REFERENCES User(userID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Lọc theo customer
CREATE INDEX idx_booking_customer ON Booking(customerID);

-- Lọc theo eventType
CREATE INDEX idx_booking_eventType ON Booking(eventTypeID);

-- Lọc theo trạng thái
CREATE INDEX idx_booking_status ON Booking(status);

-- Restaurant
CREATE INDEX idx_restaurant_partner ON Restaurant(restaurantPartnerID);
CREATE INDEX idx_restaurant_address ON Restaurant(addressID);
CREATE INDEX idx_restaurant_status ON Restaurant(status);

-- Hall
CREATE INDEX idx_hall_restaurant ON Hall(restaurantID);
CREATE INDEX idx_hall_status ON Hall(status);

-- Menu
CREATE INDEX idx_menu_restaurant ON Menu(restaurantID);
CREATE INDEX idx_menu_status ON Menu(status);

-- Service
CREATE INDEX idx_service_rest_event ON Service(restaurantID, eventTypeID);
CREATE INDEX idx_service_status ON Service(status);

-- Promotion
CREATE INDEX idx_promotion_restaurant ON Promotion(restaurantID);
CREATE INDEX idx_promotion_start_end ON Promotion(startDate, endDate);
CREATE INDEX idx_promotion_status ON Promotion(status);

-- EventType
CREATE INDEX idx_eventType_status ON EventType(status);

-- Many-to-many
CREATE INDEX idx_restaurantEventType_restaurant ON RestaurantEventType(restaurantID);
CREATE INDEX idx_restaurantEventType_eventType ON RestaurantEventType(eventTypeID);

CREATE INDEX idx_restaurantAmenities_restaurant ON RestaurantAmenities(restaurantID);
CREATE INDEX idx_restaurantAmenities_amenity ON RestaurantAmenities(amenityID);

CREATE INDEX idx_dishMenu_menu ON DishMenu(menuID);
CREATE INDEX idx_dishMenu_dish ON DishMenu(dishID);

-- Payment
CREATE INDEX idx_payment_booking ON Payment(bookingID);
CREATE INDEX idx_payment_restaurant ON Payment(restaurantID);
CREATE INDEX idx_payment_status ON Payment(status);

-- RefundPolicy
CREATE INDEX idx_refundpolicy_restaurant ON RefundPolicy(restaurantId);

-- Payouts
CREATE INDEX idx_payout_payment ON Payouts(paymentId);
CREATE INDEX idx_payout_restaurantPartner ON Payouts(restaurantPartnerId);
CREATE INDEX idx_payout_status ON Payouts(status);

-- Contract
CREATE INDEX idx_contract_booking ON Contract(bookingID);
CREATE INDEX idx_contract_status ON Contract(status);

-- Review
CREATE INDEX idx_review_booking ON Review(bookingID);
CREATE INDEX idx_review_customer ON Review(customerID);
CREATE INDEX idx_review_rating ON Review(rating);

-- Report
CREATE INDEX idx_report_user ON Report(userID);
CREATE INDEX idx_report_restaurant ON Report(restaurantID);
CREATE INDEX idx_report_review ON Report(reviewID);
CREATE INDEX idx_report_status ON Report(status);

-- Hall: filter theo số bàn, giá, status
CREATE INDEX idx_hall_capacity_price_status ON Hall(
    minTable,
    maxTable,
    price,
    status
);

-- Booking: check xem sảnh đã có booking nào trùng ngày/giờ
CREATE INDEX idx_booking_hall_datetime ON Booking(
    hallID,
    eventDate,
    startTime,
    endTime,
    status
);

-- Restaurant: filter theo địa chỉ và active
CREATE INDEX idx_restaurant_address_status ON Restaurant(
    addressID,
    status
);

-- Address: tìm theo từ khóa
ALTER TABLE Address ADD FULLTEXT INDEX idx_address_fulltext(fullAddress);

-- RestaurantEventType: filter nhà hàng có loại tiệc đó
CREATE INDEX idx_restaurant_eventtype ON RestaurantEventType(
    restaurantID,
    eventTypeID
);

-- Insert SystemSetting
INSERT INTO SystemSetting (category, settingKey, settingName, settingValue, dataType, description)
VALUES
(3, 'DEFAULT_COMMISSION_RATE', 'Tỷ lệ hoa hồng mặc định', '0.10', 1, 'Áp dụng cho chủ nhà hàng mới được duyệt'),
(2, 'REFUND_POLICY_DAYS', 'Số ngày hoàn tiền tối đa', '7', 1, 'Số ngày tối đa khách hàng có thể yêu cầu hoàn tiền'),
(1, 'MIN_BOOKING_NOTICE_HOURS', 'Thời gian đặt tiệc tối thiểu (giờ)', '48', 1, 'Phải đặt trước ít nhất 48 giờ'),
(0, 'ENABLE_PROMOTIONS', 'Cho phép hiển thị khuyến mãi', 'true', 2, 'Bật/tắt module khuyến mãi'),
(4, 'EMAIL_SENDER', 'Địa chỉ email hệ thống', 'noreply@weddinghub.vn', 0, 'Email gửi thông báo hệ thống'),
(2, 'VAT_RATE', 'Thuế giá trị gia tăng mặc định', '0.08', 1, 'Thuế VAT mặc định 8% áp dụng cho các giao dịch'),
(1, 'BOOKING_DEPOSIT_PERCENTAGE', 'Tỷ lệ tiền cọc khi khách đặt tiệc', '0.30', 1, 'Khách cần đặt cọc 30% tổng giá trị tiệc khi xác nhận booking'),
(1, 'DEFAULT_MIN_GAP_HOURS', 'Thời gian cách giữa 2 tiệc', '3', 1, 'Khoảng cách tối thiểu giữa 2 booking cùng sảnh'),
(1, 'DEFAULT_MIN_BOOKING_NOTICE_HOURS', 'Thời gian đặt trước tối thiểu', '48', 1, 'Khách phải đặt trước ít nhất 48 giờ');

-- Insert EventType
INSERT INTO EventType (name) VALUES
('Tiệc cưới'),
('Tiệc sinh nhật'),
('Tiệc công ty'),
('Tiệc tất niên'),
('Tiệc khai trương'),
('Lễ kỷ niệm'),
('Liên hoan'),
('Sự kiện');

-- Insert Amenity
INSERT INTO Amenity (name) VALUES
('Máy lạnh'),
('Hệ thống âm thanh'),
('Hệ thống ánh sáng'),
('Hệ thống micro không dây'),
('Bãi giữ xe'),
('Wi-Fi miễn phí'),
('Phòng chờ cô dâu'),
('Phòng thay đồ'),
('Nhà vệ sinh riêng'),
('Bục cake & champagne riêng'),
('Khu vực chụp ảnh'),
('Khu vực hút thuốc riêng'),
('Máy phát điện dự phòng'),
('Điều hòa trung tâm'),
('Thang máy'),
('Lối thoát hiểm'),
('Hồ bơi'),
('Camera an ninh'),
('Bục ký tên lễ tân'),
('Thảm đỏ lối vào'),
('Hoa tươi bàn tiệc cơ bản'),
('Thực đơn in sẵn trên bàn');



-- ===========================================================
-- USERS
-- ===========================================================
INSERT INTO User (email, fullName, phone, password, avatarURL, role, status)
VALUES
('admin@weddinghub.vn', 'WeddingHub Admin', '0909000000', 'hashed_admin_pw', NULL, 2, 1),
('partner.themira@gmail.com', 'Trần Minh Quân', '0905123456', 'hashed_pw_mira', 'https://randomuser.me/api/portraits/men/20.jpg', 1, 1),
('partner.lamour@gmail.com', 'Lê Ngọc Diễm', '0906789123', 'hashed_pw_lamour', 'https://randomuser.me/api/portraits/women/40.jpg', 1, 1),
('ngoc.bride@gmail.com', 'Phạm Ngọc Anh', '0902123123', 'hashed_pw_bride', 'https://randomuser.me/api/portraits/women/12.jpg', 0, 1),
('duc.groom@gmail.com', 'Nguyễn Văn Đức', '0903678456', 'hashed_pw_groom', 'https://randomuser.me/api/portraits/men/5.jpg', 0, 1);

-- ===========================================================
-- CUSTOMER
-- ===========================================================
INSERT INTO Customer (customerID, weddingRole, partnerName)
VALUES
(4, 0, 'Nguyễn Văn Đức'),  -- Bride
(5, 1, 'Phạm Ngọc Anh');   -- Groom

-- ===========================================================
-- RESTAURANT PARTNER
-- ===========================================================
INSERT INTO RestaurantPartner (restaurantPartnerID, licenseUrl, status, commissionRate)
VALUES
(2, 'https://example.com/licenses/themira.pdf', 3, 0.10),
(3, 'https://example.com/licenses/lamour.pdf', 3, 0.12);

-- ===========================================================
-- ADDRESS
-- ===========================================================
INSERT INTO Address (number, street, ward)
VALUES
('368', 'Đại lộ Bình Dương', 'Phú Cường, Thủ Dầu Một'),
('25A', 'Nguyễn Văn Linh', 'Tân Phong, Quận 7'),
('12', 'Lý Thường Kiệt', 'Hải Châu, Đà Nẵng');

-- ===========================================================
-- RESTAURANT
-- ===========================================================
INSERT INTO Restaurant (restaurantPartnerID, name, phone, description, hallCount, addressID, thumbnailURL, avgRating, totalReviews, status)
VALUES
(2, 'The Mira Wedding Hall', '0905888999', 'Không gian sang trọng, phù hợp tiệc cưới cao cấp.', 2, 1, 'https://images.unsplash.com/photo-1562059390-a761a084768e', 4.8, 126, 1),
(3, 'L’amour Wedding & Events', '0906888123', 'Phong cách châu Âu hiện đại, lãng mạn.', 3, 2, 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76', 4.6, 89, 1);

-- ===========================================================
-- RESTAURANT IMAGES
-- ===========================================================
INSERT INTO RestaurantImage (restaurantID, imageURL)
VALUES
(1, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1'),
(1, 'https://images.unsplash.com/photo-1562059390-a761a084768e'),
(2, 'https://images.unsplash.com/photo-1591348277844-4a3cfb07b3c1');

-- ===========================================================
-- RESTAURANT AMENITY
-- ===========================================================
INSERT INTO RestaurantAmenities (restaurantID, amenityID)
VALUES
(1, 1), (1, 2), (1, 5),
(2, 1), (2, 3), (2, 4), (2, 6);

-- ===========================================================
-- HALLS
-- ===========================================================
INSERT INTO Hall (restaurantID, name, description, minTable, maxTable, area, price)
VALUES
(1, 'Sảnh Diamond', 'Sảnh lớn sang trọng, 80 bàn.', 20, 80, 800.00, 12000000.00),
(1, 'Sảnh Ruby', 'Không gian ấm cúng, 40 bàn.', 10, 40, 400.00, 8000000.00),
(2, 'Sảnh Paris', 'Phong cách Pháp lãng mạn.', 15, 60, 600.00, 9500000.00),
(2, 'Sảnh Venice', 'Không gian mở hồ nước.', 10, 50, 700.00, 10500000.00);

-- ===========================================================
-- HALL IMAGE
-- ===========================================================
INSERT INTO HallImage (hallID, imageURL)
VALUES
(1, 'https://images.unsplash.com/photo-1618220039448-3d0b9233e9a2'),
(2, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'),
(3, 'https://images.unsplash.com/photo-1556912998-6e6b2b1a0f2b'),
(4, 'https://images.unsplash.com/photo-1575936123452-b67c3203c357');

-- ===========================================================
-- RESTAURANT EVENT TYPES
-- ===========================================================
INSERT INTO RestaurantEventType (restaurantID, eventTypeID)
VALUES
(1, 1), (1, 2),
(2, 1), (2, 3);

-- ===========================================================
-- DISH CATEGORY
-- ===========================================================
INSERT INTO DishCategory (restaurantID, name, requiredQuantity)
VALUES
(1, 'Khai vị', 1),
(1, 'Món chính', 2),
(1, 'Tráng miệng', 1),
(2, 'Khai vị', 1),
(2, 'Món chính', 2),
(2, 'Tráng miệng', 1);

-- ===========================================================
-- DISHES
-- ===========================================================
INSERT INTO Dish (restaurantID, name, categoryID, imageURL)
VALUES
(1, 'Tôm hấp bia', 1, 'https://images.unsplash.com/photo-1613145993481-84c29370b3f8'),
(1, 'Bò nướng tiêu đen', 2, 'https://images.unsplash.com/photo-1613145993481-84c29370b3f8'),
(1, 'Lẩu hải sản', 2, 'https://images.unsplash.com/photo-1571167375749-10a1f3c2d9b6'),
(1, 'Chè hạt sen', 3, 'https://images.unsplash.com/photo-1606755962773-0e6b22b9fa2e'),
(2, 'Súp bào ngư', 4, 'https://images.unsplash.com/photo-1617196034796-4b7fdbbc66cc'),
(2, 'Cá hồi nướng bơ tỏi', 5, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f'),
(2, 'Gà hấp muối', 5, 'https://images.unsplash.com/photo-1611171710749-1dfcf9e3c4b6'),
(2, 'Trái cây tươi', 6, 'https://images.unsplash.com/photo-1565958011705-44e21152d46e');

-- ===========================================================
-- MENU
-- ===========================================================
INSERT INTO Menu (restaurantID, name, price, imageURL)
VALUES
(1, 'Set Menu Premium A', 3500000, 'https://images.unsplash.com/photo-1562967916-eb82221dfb36'),
(2, 'Set Menu Deluxe B', 4000000, 'https://images.unsplash.com/photo-1543353071-873f17a7a088');

-- ===========================================================
-- MENU - DISH MAPPING
-- ===========================================================
INSERT INTO DishMenu (menuID, dishID)
VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 5), (2, 6), (2, 7), (2, 8);

-- ===========================================================
-- SERVICES
-- ===========================================================
INSERT INTO Service (restaurantID, eventTypeID, name, price, unit)
VALUES
(1, 1, 'Trang trí hoa tươi', 2000000, 'gói'),
(1, 1, 'MC chuyên nghiệp', 1500000, 'buổi'),
(2, 1, 'Ca sĩ biểu diễn', 4000000, 'buổi'),
(2, 3, 'Máy chiếu & màn hình LED', 2500000, 'buổi');

-- ===========================================================
-- PROMOTIONS
-- ===========================================================
INSERT INTO Promotion (restaurantID, name, description, discountType, discountValue, startDate, endDate, status)
VALUES
(1, 'Ưu đãi tháng 11', 'Giảm 10% cho tiệc cưới trong tháng 11.', 0, 10, '2025-11-01', '2025-11-30', 1),
(2, 'Giảm 15% khi đặt trước 1 tháng', 'Đặt sớm giảm 15%', 0, 15, '2025-11-01', '2025-12-31', 1);

-- ===========================================================
-- BOOKING
-- ===========================================================
INSERT INTO Booking (customerID, eventTypeID, hallID, menuID, eventDate, startTime, endTime, tableCount, specialRequest, status, originalPrice, discountAmount, VAT, totalAmount)
VALUES
(4, 1, 1, 1, '2025-12-20', '10:00:00', '14:00:00', 30, 'Yêu cầu trang trí hoa hồng trắng', 3, 105000000, 10000000, 8000000, 103000000);

-- ===========================================================
-- PAYMENT
-- ===========================================================
INSERT INTO Payment (bookingID, restaurantID, amount, type, paymentMethod, status, transactionRef)
VALUES
(1, 1, 30900000, 0, 0, 2, 'TXN001'),
(1, 1, 72000000, 1, 0, 0, 'TXN002');

-- ===========================================================
-- REVIEW
-- ===========================================================
INSERT INTO Review (bookingID, customerID, rating, comment)
VALUES
(1, 4, 5, 'Dịch vụ rất tốt, món ăn ngon, nhân viên thân thiện!');

-- ===========================================================
-- REPORT
-- ===========================================================
INSERT INTO Report (userID, restaurantID, targetType, reasonType, content, status)
VALUES
(4, 2, 0, 1, 'Nhà hàng phản hồi chậm.', 0);

-- ===========================================================
-- SYSTEM SETTINGS
-- ===========================================================
INSERT INTO SystemSetting (category, settingKey, settingName, settingValue, dataType, description)
VALUES
(3, 'DEFAULT_COMMISSION_RATE', 'Tỷ lệ hoa hồng mặc định', '0.10', 1, 'Hoa hồng mặc định cho partner'),
(2, 'VAT_RATE', 'Thuế VAT mặc định', '0.08', 1, 'Thuế giá trị gia tăng 8%'),
(1, 'BOOKING_DEPOSIT_PERCENTAGE', 'Tỷ lệ cọc khi đặt', '0.30', 1, 'Khách cần đặt cọc 30%');

DELETE FROM user WHERE userID IN (22);

SHOW CREATE TABLE customer;

use weddingrestaurantmanagement;

SELECT * FROM User;

SELECT * FROM Restaurant;
UPDATE Address
SET number = '368',
    street = 'Nguyễn Văn Linh',
    ward = 'Hải Châu'
WHERE addressID = 1;
UPDATE Address
SET number = '25A',
    street = 'Võ Nguyên Giáp',
    ward = 'Sơn Trà'
WHERE addressID = 2;
SELECT * FROM Address;

SELECT 
  r.restaurantID,
  r.name AS restaurantName,
  e.name AS eventTypeName
FROM Restaurant r
JOIN RestaurantEventType re ON r.restaurantID = re.restaurantID
JOIN EventType e ON e.eventTypeID = re.eventTypeID;

SELECT fullAddress FROM address WHERE addressID IN (SELECT addressID FROM restaurant);


SELECT * FROM HALL;

DESCRIBE hall;

SELECT restaurantID, name, restaurantPartnerID 
FROM restaurant;

SELECT userID, fullName, role FROM user WHERE role = 1;

SELECT * FROM restaurant WHERE restaurantPartnerID = 2;
UPDATE restaurant SET status = 1 WHERE status IS NULL;
				SELECT * FROM payment;
SELECT * FROM review;
SELECT * FROM report;


SELECT 
    rp.reportID,
    rp.content,
    rp.status,
    rp.reasonType,
    rp.createdAt,
    u.fullName AS reporterName,
    res.name AS restaurantName
FROM report rp
LEFT JOIN user u 
    ON rp.userID = u.userID
LEFT JOIN restaurant res 
    ON rp.restaurantID = res.restaurantID
ORDER BY rp.createdAt DESC;


