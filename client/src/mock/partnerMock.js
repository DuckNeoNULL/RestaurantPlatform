// partnerMock.js
const mock = {
  // Partner info
  partner: {
    id: 4,
    fullName: "Nguyen Van A",
    email: "partner@example.com",
    phone: "0123456789",
    role: 1,
  },

  // Restaurants
  restaurants: [
    {
      restaurantID: 1,
      restaurantPartnerID: 4,
      name: "Nhà hàng Tiệc Cưới A",
      description: "Không gian sang trọng, phục vụ chuyên nghiệp.",
      hallCount: 3,
      addressID: 1,
      thumbnailURL: "https://source.unsplash.com/400x250/?wedding,restaurant",
      avgRating: 4.5,
      totalReviews: 120,
      status: 1,
      amenities: [1, 2, 3],
      halls: [
        {
          hallID: 1,
          name: "Sảnh Ruby",
          description: "Sảnh sang trọng, phù hợp tiệc cưới quy mô vừa.",
          capacity: 300,
          area: 500,
          price: 5000000,
          status: 1,
        },
        {
          hallID: 2,
          name: "Sảnh Diamond",
          description: "Sảnh lớn, sức chứa tới 500 khách.",
          capacity: 500,
          area: 800,
          price: 7000000,
          status: 1,
        },
      ],
      menu: [1, 2],
      services: [1, 2],
      promotions: [1],
    },
    {
      restaurantID: 2,
      restaurantPartnerID: 4,
      name: "Nhà hàng Tiệc Cưới B",
      description: "Không gian thoáng đãng, phù hợp tiệc gia đình.",
      hallCount: 2,
      addressID: 2,
      thumbnailURL: "https://source.unsplash.com/400x250/?banquet,hall",
      avgRating: 4.0,
      totalReviews: 50,
      status: 1,
      amenities: [2, 4],
      halls: [
        {
          hallID: 3,
          name: "Sảnh Pearl",
          description: "Sảnh nhỏ, ấm cúng cho tiệc gia đình.",
          capacity: 200,
          area: 300,
          price: 4000000,
          status: 1,
        },
      ],
      menu: [3],
      services: [3],
      promotions: [],
    },
  ],

  // Amenities
  amenities: [
    { amenityID: 1, name: "Wifi", status: 1 },
    { amenityID: 2, name: "Bãi đỗ xe", status: 1 },
    { amenityID: 3, name: "Sân khấu", status: 1 },
    { amenityID: 4, name: "Âm thanh ánh sáng", status: 1 },
  ],

  // Dish categories
  dishCategories: [
    { categoryID: 1, name: "Khai vị", requiredQuantity: 1, status: 1 },
    { categoryID: 2, name: "Món chính", requiredQuantity: 3, status: 1 },
    { categoryID: 3, name: "Tráng miệng", requiredQuantity: 1, status: 1 },
  ],

  // Dishes
  dish: [
    { dishID: 1, restaurantID: 1, name: "Gà quay mật ong", categoryID: 2, imageURL: "https://file.hstatic.net/200000700229/article/lam-dui-ga-nuong-mat-ong-bang-lo-nuong-1_e17f9ace600a40018ed4fd25b8d1f30f.jpg", status: 1 },
    { dishID: 2, restaurantID: 1, name: "Súp hải sản", categoryID: 1, imageURL: "https://i.ytimg.com/vi/bkdzyAHyxtc/hq720.jpg", status: 1 },
    { dishID: 3, restaurantID: 2, name: "Salad rau củ", categoryID: 1, imageURL: "https://cookingwithayeh.com/wp-content/uploads/2023/11/Healthy-Caesar-Salad-Without-Anchovies-SQ-5.jpg", status: 1 },
    { dishID: 4, restaurantID: 2, name: "Tôm hùm nướng bơ tỏi", categoryID: 2, imageURL: "https://beachgirlgrills.com/wp-content/uploads/IMG_6686-1.jpg", status: 1 },
    { dishID: 5, restaurantID: 1, name: "Bò sốt tiêu đen", categoryID: 2, imageURL: "https://i.pinimg.com/1200x/82/2b/6f/822b6f17349bc8a626dd6de9169122ea.jpg", status: 1 },
    { dishID: 6, restaurantID: 1, name: "Trái cây tổng hợp", categoryID: 3, imageURL: "https://www.healthyfood.com/wp-content/uploads/2024/11/Dessert-platter.jpg", status: 1 },
    { dishID: 7, restaurantID: 1, name: "Thịt heo tonkatsu", categoryID: 2, imageURL: "https://japan.net.vn/images/uploads/2018/12/15/2-tonkatsu-la-gi.jpg", status: 1 },
    { dishID: 8, restaurantID: 1, name: "Cacio e pepe", categoryID: 1, imageURL: "https://www.southernliving.com/thmb/XYa-5lrO5mXamAE6_1PzhDSdK3A=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/29979_SupT_Pasta_086-1-b954646f72224fdb801d2d08462013ef.jpg", status: 1 },
    { dishID: 9, restaurantID: 1, name: "Tiramisu", categoryID: 3, imageURL: "https://atavolagastronomia.com/wp-content/uploads/tiramisu-4583.jpg", status: 1 },
    { dishID: 10, restaurantID: 1, name: "Pad thái", categoryID: 1, imageURL: "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/178275/Originals/Pad-Thai-1.jpg", status: 1 },
    { dishID: 11, restaurantID: 1, name: "Đuôi bò hầm tiêu đen Nigeria", categoryID: 2, imageURL: "https://i.ytimg.com/vi/W0Qit8PfPpQ/maxresdefault.jpg", status: 1 },
    { dishID: 12, restaurantID: 1, name: "Hàu nướng mỡ hành", categoryID: 1, imageURL: "https://bepmina.vn/wp-content/uploads/2023/08/hau-nuong-mo-hanh-scaled.jpeg", status: 1 },
    { dishID: 13, restaurantID: 1, name: "Nhum biển nướng mỡ hành", categoryID: 1, imageURL: "https://www.hoabinhrachgiaresort.com.vn/files/files/Tin%20tuc/nhum-bien-phu-quoc-4.jpg", status: 1 },
    { dishID: 14, restaurantID: 1, name: "Cá hồi sốt cam", categoryID: 2, imageURL: "https://hips.hearstapps.com/hmg-prod/images/baked-salmon-index-650b19174ffc1.jpg", status: 1 },
    { dishID: 15, restaurantID: 1, name: "Tôm nhật hấp bia", categoryID: 2, imageURL: "https://shiros.com/wp-content/uploads/2020/08/amaebi_ht.jpg", status: 1 },
  ],

  // Menus
  menu: [
    { menuID: 1, restaurantID: 1, name: "Menu Tiệc Cưới A", price: 3500000, imageURL: "https://file.hstatic.net/200000944907/file/menu_lunch_resize_web_5_5e7ac9c611aa4bc190f3e8f0a285fe93_master.jpg", status: 1, dishes: [1, 2, 5, 6, 7] },
    { menuID: 2, restaurantID: 1, name: "Menu Tiệc Cưới B", price: 2500000, imageURL: "https://file.hstatic.net/200000944907/file/menu_lunch_resize_web_3_00f6972bdcb64472b9fa2d131c23d8d0_master.jpg", status: 1, dishes: [2, 5, 6] },
    { menuID: 3, restaurantID: 2, name: "Menu VIP", price: 4000000, imageURL: "https://file.hstatic.net/200000944907/file/menu_lunch_resize_web_9_673350deab3546638e667734b71958a2_master.jpg", status: 1, dishes: [3, 4, 5, 6] },
  ],

  // Services
  services: [
    { serviceID: 1, restaurantID: 1, eventTypeID: 1, name: "Photography", price: 3000000, unit: "package", status: 1 },
    { serviceID: 2, restaurantID: 1, eventTypeID: 1, name: "Wedding Planner", price: 5000000, unit: "package", status: 1 },
    { serviceID: 3, restaurantID: 2, eventTypeID: 1, name: "Live Music", price: 2000000, unit: "hour", status: 1 },
  ],

  // Promotions
  promotions: [
    {
      promotionID: 1,
      restaurantID: 1,
      name: "Autumn Promo - 10% off",
      description: "Giảm 10% cho tiệc cưới tháng 10",
      minTable: 0,
      discountType: 0,
      discountValue: 10,
      startDate: "2025-10-01",
      endDate: "2025-10-31",
      status: 1,
    },
  ],

  // Customers (thêm cho an toàn khi render)
  customers: [
    { customerID: 1, fullName: "Trần Thị B", phone: "0909123456", email: "tranb@example.com" },
    { customerID: 2, fullName: "Lê Văn C", phone: "0912345678", email: "levanc@example.com" },
  ],

  // Bookings
  bookings: [
    {
      bookingID: 101,
      customerID: 1,
      eventTypeID: 1,
      hallID: 1,
      menuID: 1,
      eventDate: "2025-11-15",
      startTime: "18:00",
      endTime: "22:00",
      tableCount: 20,
      specialRequest: "Trang trí hoa hồng",
      status: 0,
      originalPrice: 12000000,
      discountAmount: 0,
      VAT: 1200000,
      totalAmount: 13200000,
    },
    {
      bookingID: 102,
      customerID: 2,
      eventTypeID: 1,
      hallID: 3,
      menuID: 3,
      eventDate: "2025-12-01",
      startTime: "17:00",
      endTime: "21:00",
      tableCount: 15,
      specialRequest: "",
      status: 1,
      originalPrice: 25000000,
      discountAmount: 2500000,
      VAT: 2250000,
      totalAmount: 24750000,
    },
  ],

  // Event types
  eventTypes: [
    { eventTypeID: 1, name: "Tiệc cưới", status: 1 },
    { eventTypeID: 2, name: "Sinh nhật", status: 1 },
  ],
};
export const notifications = [
  {
    id: 1,
    type: "booking",
    title: "Booking BK001",
    message: "Đặt chỗ BK001 đã được xác nhận",
    date: "2025-10-08T09:00:00",
  },
  {
    id: 2,
    type: "payment",
    title: "Thanh toán BK002",
    message: "Thanh toán chưa hoàn tất",
    date: "2025-10-07T14:30:00",
  },
  {
    id: 3,
    type: "system",
    title: "Payout PO001",
    message: "Payout đã chuyển thành công",
    date: "2025-10-06T18:00:00",
  },
];

// Users
const users = [
  {
    userID: 1,
    email: "tranb@example.com",
    fullName: "Trần Thị B",
    phone: "0909123456",
    password: "hashed_pw_customer_1",
    avatarURL: "https://randomuser.me/api/portraits/women/45.jpg",
    spent: 2500000,
    role: 0, // CUSTOMER
    createdAt: "2025-09-10T09:30:00",
    status: 1,
  },
  {
    userID: 2,
    email: "levanc@example.com",
    fullName: "Lê Văn C",
    phone: "0912345678",
    password: "hashed_pw_customer_2",
    avatarURL: "https://randomuser.me/api/portraits/men/56.jpg",
    role: 0, // CUSTOMER
    createdAt: "2025-09-15T11:10:00",
    status: 1,
  },
  {
    userID: 3,
    email: "admin@lifevent.vn",
    fullName: "Nguyễn Thịnh",
    phone: "0901234567",
    password: "hashed_pw_admin",
    avatarURL: "https://randomuser.me/api/portraits/men/11.jpg",
    role: 2, // ADMIN
    createdAt: "2025-08-01T10:00:00",
    status: 1,
  },
  {
    userID: 4,
    email: "partner@example.com",
    fullName: "Nguyen Van A",
    phone: "0123456789",
    password: "hashed_pw_partner",
    avatarURL: "https://randomuser.me/api/portraits/men/20.jpg",
    role: 1, // RESTAURANT_PARTNER
    createdAt: "2025-09-20T15:45:00",
    status: 1,
  },
];

// Addresses
const addresses = [
  {
    addressID: 1,
    number: "12",
    street: "Lê Lợi",
    ward: "Phường Bến Nghé",
  },
  {
    addressID: 2,
    number: "45",
    street: "Nguyễn Huệ",
    ward: "Phường Bến Thành",
  },
];

export const usersMock = users;
export const addressesMock = addresses;
export default mock;


