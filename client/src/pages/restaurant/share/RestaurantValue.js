// EVENT TYPE MAP (mock)
// 1: WEDDING, 2: COMPANY, 3: CONFERENCE, 4: EVENT (generic), 0: ALL PURPOSES
export const EVENT_TYPE_MAP = {
  WEDDING: 1,
  COMPANY: 2,
  CONFERENCE: 3,
  EVENT: 4,
  ALL: 0
};

export const restaurantDetail = {
  id: 1,
  name: "Quảng Đại Gold",
  description: "Quảng Đại Gold là một địa điểm ấn tượng tọa lạc tại Lô 25-27, đường 30/4, phường Hòa Cường Bắc, quận Hải Châu, Đà Nẵng . Với vị trí đắc địa, Quảng Đại Gold vừa thuận tiện cho việc tiếp cận vừa nổi bật giữa trung tâm thành phố. Là một nhà hàng – trung tâm tiệc cưới cao cấp, Quảng Đại Gold mang đến cho thực khách không gian sang trọng, hiện đại nhưng vẫn ấm cúng, phù hợp cho các dịp lễ trọng đại hoặc những buổi gặp gỡ trang trọng. Khách đến đây sẽ cảm nhận được sự tinh tế trong thiết kế: tông màu vàng ánh kim chủ đạo hài hoà với ánh sáng ấm, kết hợp cùng vật liệu cao cấp, chi tiết decor nhẹ nhàng nhưng tinh xảo.",
  thumbnailURL: "https://phongsucuoidanang.com/wp-content/uploads/2024/10/voan-che-dau-danh-cho-co-dau-mum-mim.webp",
  address: {
    number: "8",
    street: "30 Tháng 4",
    ward: "Hải Châu",
    fullAddress: "8 30 Tháng 4, Hải Châu"
  },
  hallCount: 2,
  images: [
    "https://phongsucuoidanang.com/wp-content/uploads/2024/09/nha-hang-tiec-cuoi-da-nang-minh-chau-viet.webp",
    "https://phongsucuoidanang.com/wp-content/uploads/2024/09/nha-hang-tiec-cuoi-da-nang-quang-dai-gold-anh-3.webp"
  ],
  amenities: ["Bãi đỗ xe", "Âm thanh ánh sáng", "Máy chiếu màn hình LED"],

  halls: [
    {
      id: 1,
      name: "Sảnh Hoa Hồng",
      description: "Gs a pool with a view. The air-conditioned villa features 1 bedroom and 1 bathroom with a shower and a hairdryer. Featuring a balcony with pool views, this villa also offers soundproof walls and a flat-screen TV with streaming services. The unit offers 2 beds.",
      capacity: 500,
      area: 600,
      price: 30000000,
      images: ["https://phongsucuoidanang.com/wp-content/uploads/2024/09/nha-hang-tiec-cuoi-da-nang-quang-dai-gold.webp", "https://phongsucuoidanang.com/wp-content/uploads/2024/10/voan-che-dau-danh-cho-co-dau-mum-mim.webp"]
    },
    {
      id: 2,
      name: "Sảnh Tulip",
      description: "Sảnh nhỏ 200 khách",
      capacity: 200,
      area: 250,
      price: 15000000,
      images: ["https://phongsucuoidanang.com/wp-content/uploads/2024/10/tiec-cuoi-hanh-phuc-ben-nguoi-than-gp-wedding.webp"]
    }
  ],

  menus: [
    {
      id: 1,
      name: "Menu Truyền Thống",
      price: 3500000,
      categories: [
        {
          name: "Món khai vị",
          requiredQuantity: 2,
          dishes: [
            { id: 1, name: "Gỏi ngó sen tôm thịt" },
            { id: 2, name: "Súp cua gà xé" }
          ]
        },
        {
          name: "Món chính",
          requiredQuantity: 3,
          dishes: [
            { id: 3, name: "Gà hấp lá chanh" },
            { id: 4, name: "Bò nướng tiêu đen" }
          ]
        },
        {
          name: "Tráng miệng",
          requiredQuantity: 1,
          dishes: [
            { id: 5, name: "Chè hạt sen long nhãn" }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Menu Chay",
      price: 3500000,
      categories: [
        {
          name: "Món khai vị",
          requiredQuantity: 2,
          dishes: [
            { id: 1, name: "Gỏi ngó sen tôm thịt" },
            { id: 2, name: "Súp cua gà xé" }
          ]
        },
        {
          name: "Món chính",
          requiredQuantity: 3,
          dishes: [
            { id: 3, name: "Gà hấp lá chanh" },
            { id: 4, name: "Bò nướng tiêu đen" }
          ]
        },
        {
          name: "Tráng miệng",
          requiredQuantity: 1,
          dishes: [
            { id: 5, name: "Chè hạt sen long nhãn" }
          ]
        }
      ]
    }
  ],

  // Services mock enriched with eventTypeID to test filtering per usageType
  // status: 1 = ACTIVE, 0 = INACTIVE
  // eventTypeID meanings: see EVENT_TYPE_MAP above
  services: [
    // Wedding specific
    { serviceID: 101, eventTypeID: EVENT_TYPE_MAP.WEDDING, name: "Trang trí hoa tươi chuẩn cưới", price: 5000000, unit: "gói", status: 1 },
    { serviceID: 102, eventTypeID: EVENT_TYPE_MAP.WEDDING, name: "Cổng hoa Luxury", price: 7500000, unit: "gói", status: 1 },
    { serviceID: 103, eventTypeID: EVENT_TYPE_MAP.WEDDING, name: "MC Lễ cưới", price: 4000000, unit: "buổi", status: 1 },
    // Company specific
    { serviceID: 201, eventTypeID: EVENT_TYPE_MAP.COMPANY, name: "Backdrop giới thiệu sản phẩm", price: 6000000, unit: "gói", status: 1 },
    { serviceID: 202, eventTypeID: EVENT_TYPE_MAP.COMPANY, name: "Ban nhạc Acoustic", price: 8500000, unit: "buổi", status: 1 },
    { serviceID: 203, eventTypeID: EVENT_TYPE_MAP.COMPANY, name: "MC Sự kiện doanh nghiệp", price: 4500000, unit: "buổi", status: 1 },
    // Conference specific
    { serviceID: 301, eventTypeID: EVENT_TYPE_MAP.CONFERENCE, name: "Hệ thống trình chiếu nâng cao", price: 9000000, unit: "gói", status: 1 },
    { serviceID: 302, eventTypeID: EVENT_TYPE_MAP.CONFERENCE, name: "Thiết bị phiên dịch", price: 12000000, unit: "gói", status: 1 },
    { serviceID: 303, eventTypeID: EVENT_TYPE_MAP.CONFERENCE, name: "Ghi hình - Livestream", price: 7000000, unit: "buổi", status: 1 },
    // Generic event (EVENT)
    { serviceID: 401, eventTypeID: EVENT_TYPE_MAP.EVENT, name: "Ánh sáng sân khấu", price: 6500000, unit: "gói", status: 1 },
    { serviceID: 402, eventTypeID: EVENT_TYPE_MAP.EVENT, name: "Âm thanh chuẩn sự kiện", price: 8000000, unit: "gói", status: 1 },
    { serviceID: 403, eventTypeID: EVENT_TYPE_MAP.EVENT, name: "Quay phim - Chụp ảnh", price: 5500000, unit: "buổi", status: 1 },
    // All-purpose (available for all usage types)
    { serviceID: 901, eventTypeID: EVENT_TYPE_MAP.ALL, name: "Trang trí bảng chào", price: 1500000, unit: "gói", status: 1 },
    { serviceID: 902, eventTypeID: EVENT_TYPE_MAP.ALL, name: "Lễ tân đón khách", price: 3000000, unit: "buổi", status: 1 },
    // Inactive (should be ignored in active filtering tests)
    { serviceID: 999, eventTypeID: EVENT_TYPE_MAP.WEDDING, name: "Dịch vụ thử nghiệm (INACTIVE)", price: 1111111, unit: "gói", status: 0 }
  ],

  promotions: [
    {
      id: 1,
      name: "Giảm 10% cho tiệc từ 30 bàn",
      description: "Ưu đãi mùa cưới",
      minTable: 30,
      discountType: "PERCENT",
      discountValue: 0.1,
      startDate: "2025-09-01",
      endDate: "2025-12-31"
    }
  ],

  reviews: [
    {
      id: 1,
      customerName: "Nguyễn Thị Thắm",
      rating: 4,
      comment: "Nhà hàng đẹp, phục vụ tận tình, món ăn ngon!",
      createdAt: "2025-09-20 12:30:00"
    },
    {
      id: 2,
      customerName: "Nguyễn Văn Tài",
      rating: 5,
      comment: "Thật sự là nhà hàng này quá ngon, rất tuyệt vời!",
      createdAt: "2025-09-21 12:30:00"
    },
    {
      id: 3,
      customerName: "Anh Mộ Xum Xuê",
      rating: 3,
      comment: "Alo Quảng Đại à, phải Quảng Đại đó không?",
      createdAt: "2025-09-30 12:30:00"
    }
  ]
};