import { useState, useEffect } from "react"
import { Container, Row, Col } from "react-bootstrap"
import Header from "../../../components/header/Header"
import Footer from "../../../components/Footer"
import BookingCard from "../components/BookingCard"
import { useNavigate } from "react-router-dom"
import ScrollToTopButton from "../../../components/ScrollToTopButton"
// import { bookings as mockBookings } from "./ValueStore" // dùng dữ liệu backend thay mock
  import { getMyBookings, customerConfirm, customerCancel } from "../../../services/bookingService"
import useAuth from "../../../hooks/useAuth"
import useBooking from "../../../hooks/useBooking"
import { useAdditionRestaurant } from "../../../hooks/useAdditionRestaurant"
import { fetchDishCategoriesByRestaurant } from "../../../redux/slices/additionRestaurantSlice"
import { useDispatch } from "react-redux"
import { useReview } from "../../../hooks/useReview"
import "bootstrap/dist/css/bootstrap.min.css"

function buildDetailPayload(b, categoriesMap) {
  // Build customer info strictly from booking data (not auth)
  const embeddedUser = b.customer?.user || {}
  const customer = {
    fullName: b.customer?.user?.fullName || embeddedUser.fullName || embeddedUser.name || "Khách hàng",
    phone: b.customer?.user?.phone || embeddedUser.phone || "N/A",
    email: b.customer?.user?.email || embeddedUser.email || "N/A",
  }
  // Build restaurant from hall.restaurant
  const restaurant = {
    name: b.hall?.restaurant?.name || "Nhà hàng",
    address: b.hall?.restaurant?.fullAddress || "Đang cập nhật",
    thumbnailURL: b.hall?.restaurant?.thumbnailURL || "",
  }

  // Build hall
  const hall = {
    name: b.hall?.name || "Sảnh",
    capacity: b.hall?.maxTable || b.tableCount || 0,
    area: parseFloat(b.hall?.area) || 0,
    price: parseFloat(b.hall?.price) || 0,
  }

  // Build menu with categories from bookingdishes
  const dishMap = {};
  (b.bookingdishes || []).forEach(bd => {
    const dish = bd.dish;
    const categoryId = dish.categoryID;
    if (!dishMap[categoryId]) {
      dishMap[categoryId] = {
        name: categoriesMap[categoryId]?.name || `Danh mục ${categoryId}`,
        dishes: []
      };
    }
    dishMap[categoryId].dishes.push({
      id: dish.dishID,
      name: dish.name,
      price: 0,
      imageURL: dish.imageURL,
      category: categoriesMap[categoryId]?.name || `Danh mục ${categoryId}`
    });
  });
  const menu = {
    name: b.menu?.name || "Menu đã chọn",
    price: parseFloat(b.menu?.price) || 0,
    categories: Object.values(dishMap)
  }

  // Build services from bookingservices
  const services = (b.bookingservices || []).map(bs => ({
    name: bs.service?.name || "Dịch vụ",
    quantity: bs.quantity || 1,
    price: parseFloat(bs.service?.price) || 0
  }));

  return {
    bookingID: b.bookingID,
    status: b.status ?? 0,
    eventType: b.eventType?.name || "Tiệc cưới",
    eventDate: b.eventDate,
    startTime: b.startTime || "18:00",
    endTime: b.endTime || "22:00",
    tableCount: b.tableCount || 0,
    specialRequest: b.specialRequest || "",
    createdAt: b.createdAt || new Date().toISOString(),
    customer,
    restaurant,
    hall,
    menu,
    services,
    payments: b.payments || [],
    contract: b.contract || {
      content: "Hợp đồng dịch vụ...",
      status: 0,
      signedAt: null,
    },
    originalPrice: parseFloat(b.originalPrice) || 0,
    discountAmount: parseFloat(b.discountAmount) || 0,
    VAT: parseFloat(b.VAT) || 0,
    totalAmount: parseFloat(b.totalAmount) || 0,
  }
}

function BookingListPage() {
  const navigate = useNavigate()

  const { user } = useAuth()
  const { hydrateFromDTO, setFinancial } = useBooking()
  const [bookingsData, setBookingsData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const dispatch = useDispatch()
  const [categoriesMap, setCategoriesMap] = useState({})
  const { createOne: createReview } = useReview()
console.log(bookingsData);
  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError("")
      try {
        const rows = await getMyBookings()
        if (!ignore) {
          // Chuẩn hoá vài trường để BookingCard dùng ổn định (ưu tiên DTO chi tiết từ backend)
          const normalized = rows.map(r => {
            const hall = r.hall || { name: r.hallName || "Sảnh", capacity: (r.tableCount || 0) * 10 };
            const restaurantObj = r.restaurant || hall?.restaurant || null;
            const restaurant = restaurantObj ? {
              ...restaurantObj,
              name: restaurantObj.name || r.restaurantName || "Nhà hàng",
              fullAddress: restaurantObj.fullAddress || restaurantObj.address || r.restaurantAddress || "",
              thumbnailURL: restaurantObj.thumbnailURL || restaurantObj.thumbnail || "",
            } : { name: r.restaurantName || "Nhà hàng", fullAddress: r.restaurantAddress || "", thumbnailURL: "" };
            const menu = r.menu || { name: r.menuName || "Menu", price: r.pricePerTable || 0 };
            return { ...r, hall, restaurant, menu };
          });
          setBookingsData(normalized)
        }
      } catch (e) {
        if (!ignore) setError(e.message || "Không thể tải danh sách đặt chỗ")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [user?.userID])

  useEffect(() => {
    if (bookingsData.length === 0) return;
    const uniqueRestaurantIds = [...new Set(bookingsData.map(b => b.hall?.restaurant?.restaurantID).filter(id => id))];
    const fetchCategories = async () => {
      const newMap = {};
      for (const id of uniqueRestaurantIds) {
        try {
          const categories = await dispatch(fetchDishCategoriesByRestaurant(id)).unwrap();
          categories.forEach(cat => {
            newMap[cat.categoryID] = cat;
          });
        } catch (e) {
          console.error('Failed to fetch categories for restaurant', id, e);
        }
      }
      setCategoriesMap(newMap);
    };
    fetchCategories();
  }, [bookingsData, dispatch])

  // Với dữ liệu thật từ backend, bỏ sessionStorage persist (có thể giữ nếu cần offline cache)

  async function handleConfirm(b) {
    try {
      await customerConfirm(b.bookingID)
      setBookingsData(prev => prev.map(it => it.bookingID === b.bookingID ? { ...it, status: 3 } : it))
    } catch (e) {
      alert(e.message || 'Xác nhận booking thất bại')
    }
  }

  async function handleCancel(b, note) {
    try {
      await customerCancel(b.bookingID, note)
      // Keep cancelled bookings visible; just update status to 6 (CANCELLED)
      setBookingsData(prev => prev.map(it => it.bookingID === b.bookingID ? { ...it, status: 6 } : it))
    } catch (e) {
      alert(e.message || 'Hủy booking thất bại')
    }
  }

  function handleTransfer(b) {
    console.log("Transfer deposit for booking", b.bookingID)
  }

  async function handleReview(b, payload) {
    try {
      const restaurantID = b?.hall?.restaurant?.restaurantID || b?.restaurant?.restaurantID
      if (!restaurantID) throw new Error("Thiếu restaurantID để tạo đánh giá")
      // Map ReviewModal payload to API: content -> comment
      await createReview(restaurantID, {
        bookingID: b.bookingID,
        rating: payload?.rating,
        comment: payload?.content || "",
      })
      alert("Gửi đánh giá thành công!")
      // Optional: you could refresh reviews here if showing inline
    } catch (e) {
      alert(e.message || "Gửi đánh giá thất bại")
    }
  }

  function handleOpenContract(b) {
    // Lưu toàn bộ dữ liệu booking từ backend
    const payload = buildDetailPayload(b, categoriesMap)
    sessionStorage.setItem(`booking_${b.bookingID}`, JSON.stringify(payload))
    navigate(`/booking/${b.bookingID}`)
  }

  function handleViewContract(b) {
    // Lưu toàn bộ dữ liệu booking từ backend
    const payload = buildDetailPayload(b, categoriesMap)
    sessionStorage.setItem(`booking_${b.bookingID}`, JSON.stringify(payload))
    navigate(`/booking/${b.bookingID}`)
  }

  return (
    <>
      <Header />
      <div style={{
        background: '#ffffff',
        minHeight: '100vh',
        paddingTop: '40px',
        paddingBottom: '60px'
      }}>
        <Container fluid className="py-4">
          <Row className="mb-4">
            <Col lg={6} md={8} xs={12} className="offset-lg-1">
              <div style={{
                borderLeft: '4px solid rgb(225, 29, 72)',
                paddingLeft: '20px',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'rgb(225, 29, 72)',
                  marginBottom: '8px',
                  letterSpacing: '-0.5px'
                }}>
                  Lịch sử đặt chỗ
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  margin: 0
                }}>
                  Quản lý và theo dõi các đặt chỗ của bạn
                </p>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={10} md={10} xs={12} className="offset-lg-1 offset-md-1">
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>Đang tải dữ liệu...</div>
                ) : error ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#dc2626' }}>{error}</div>
                ) : bookingsData.length === 0 ? (
                  <div style={{
                    background: '#ffffff',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '16px',
                    padding: '60px 40px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, rgb(225, 29, 72) 0%, rgb(190, 24, 61) 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      boxShadow: '0 10px 30px rgba(225, 29, 72, 0.2)'
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <p style={{
                      fontSize: '1.25rem',
                      color: '#1f2937',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Chưa có đặt chỗ nào
                    </p>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.95rem',
                      margin: 0
                    }}>
                      Bạn chưa thực hiện đặt chỗ nào. Hãy bắt đầu đặt chỗ ngay hôm nay!
                    </p>
                  </div>
                ) : (
                  bookingsData.map((b) => (
                    <div key={b.bookingID} style={{
                      marginBottom: '24px',
                      borderRadius: '12px',
                      border: '1px solid #f3f4f6',
                      transition: 'all 0.3s ease',
                      background: '#ffffff'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(225, 29, 72, 0.12)'
                        e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                        e.currentTarget.style.borderColor = '#f3f4f6'
                      }}>
                      <BookingCard
                        booking={b}
                        categoriesMap={categoriesMap}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                        onTransfer={handleTransfer}
                        onOpenContract={handleOpenContract}
                        onReview={handleReview}
                        onViewContract={handleViewContract}
                      />
                    </div>
                  ))
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <ScrollToTopButton />
      <Footer />
    </>
  )
}

export default BookingListPage