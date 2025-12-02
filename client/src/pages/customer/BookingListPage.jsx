// "use client"

// import { useState, useEffect } from "react"
// import { Container, Row, Col } from "react-bootstrap"
// import Header from "../../components/header/Header"
// import Footer from "../../components/Footer"
// import BookingCard from "./components/BookingCard"
// import { useNavigate } from "react-router-dom"
// import ScrollToTopButton from "../../components/ScrollToTopButton"
// // import { bookings as mockBookings } from "./ValueStore" // dùng dữ liệu backend thay mock
// import { getMyBookings, customerConfirm, customerCancel } from "../../services/bookingService"
// import useAuth from "../../hooks/useAuth"
// import useBooking from "../../hooks/useBooking"
// import "bootstrap/dist/css/bootstrap.min.css"

// function BookingListPage() {
//   const navigate = useNavigate()

//   const { user } = useAuth()
//   const { hydrateFromDTO, setFinancial } = useBooking()
//   const [bookingsData, setBookingsData] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     let ignore = false
//     async function load() {
//       setLoading(true)
//       setError("")
//       try {
//         const rows = await getMyBookings()
//         if (!ignore) {
//           // Chuẩn hoá vài trường để BookingCard dùng ổn định (ưu tiên DTO chi tiết từ backend)
//           const normalized = rows.map(r => {
//             const hall = r.hall || { name: r.hallName || "Sảnh", capacity: (r.tableCount || 0) * 10 };
//             const restaurantObj = r.restaurant || hall?.restaurant || null;
//             const restaurant = restaurantObj ? {
//               ...restaurantObj,
//               name: restaurantObj.name || r.restaurantName || "Nhà hàng",
//               fullAddress: restaurantObj.fullAddress || restaurantObj.address || r.restaurantAddress || "",
//               thumbnailURL: restaurantObj.thumbnailURL || restaurantObj.thumbnail || "",
//             } : { name: r.restaurantName || "Nhà hàng", fullAddress: r.restaurantAddress || "", thumbnailURL: "" };
//             const menu = r.menu || { name: r.menuName || "Menu", price: r.pricePerTable || 0 };
//             return { ...r, hall, restaurant, menu };
//           });
//           setBookingsData(normalized)
//         }
//       } catch (e) {
//         if (!ignore) setError(e.message || "Không thể tải danh sách đặt chỗ")
//       } finally {
//         if (!ignore) setLoading(false)
//       }
//     }
//     load()
//     return () => { ignore = true }
//   }, [user?.userID])

//   // Với dữ liệu thật từ backend, bỏ sessionStorage persist (có thể giữ nếu cần offline cache)

//   async function handleConfirm(b) {
//     try {
//       await customerConfirm(b.bookingID)
//       setBookingsData(prev => prev.map(it => it.bookingID === b.bookingID ? { ...it, status: 3 } : it))
//     } catch (e) {
//       alert(e.message || 'Xác nhận booking thất bại')
//     }
//   }

//   async function handleCancel(b, note) {
//     try {
//       await customerCancel(b.bookingID, note)
//       setBookingsData(prev => prev.map(it => it.bookingID === b.bookingID ? { ...it, status: 6, cancelReason: note || '' } : it))
//     } catch (e) {
//       alert(e.message || 'Hủy booking thất bại')
//     }
//   }

//   function handleTransfer(b) {
//     console.log("Transfer deposit for booking", b.bookingID)
//   }

//   function handleReview(b, payload) {
//     console.log("Review booking", b.bookingID, payload)
//   }

//   function handleOpenContract(b) {
//     // Đổ dữ liệu chi tiết booking vào Redux để trang chi tiết có thể dùng ngay
//     try {
//       hydrateFromDTO(b)
//       setFinancial({
//         originalPrice: b.originalPrice,
//         discountAmount: b.discountAmount,
//         VAT: b.VAT,
//         totalAmount: b.totalAmount,
//       })
//     } catch { }
//     sessionStorage.setItem(`booking_${b.bookingID}`, JSON.stringify(b))
//     navigate(`/booking/${b.bookingID}`)
//   }

//   function handleViewContract(b) {
//     try {
//       hydrateFromDTO(b)
//       setFinancial({
//         originalPrice: b.originalPrice,
//         discountAmount: b.discountAmount,
//         VAT: b.VAT,
//         totalAmount: b.totalAmount,
//       })
//     } catch { }
//     sessionStorage.setItem(`booking_${b.bookingID}`, JSON.stringify(b))
//     navigate(`/booking/${b.bookingID}`)
//   }

//   return (
//     <>
//       <Header />
//       <div style={{
//         background: '#ffffff',
//         minHeight: '100vh',
//         paddingTop: '40px',
//         paddingBottom: '60px'
//       }}>
//         <Container fluid className="py-4">
//           <Row className="mb-4">
//             <Col lg={6} md={8} xs={12} className="offset-lg-1">
//               <div style={{
//                 borderLeft: '4px solid rgb(225, 29, 72)',
//                 paddingLeft: '20px',
//                 marginBottom: '30px'
//               }}>
//                 <h2 style={{
//                   fontSize: '2rem',
//                   fontWeight: '700',
//                   color: 'rgb(225, 29, 72)',
//                   marginBottom: '8px',
//                   letterSpacing: '-0.5px'
//                 }}>
//                   Lịch sử đặt chỗ
//                 </h2>
//                 <p style={{
//                   color: '#6b7280',
//                   fontSize: '0.95rem',
//                   margin: 0
//                 }}>
//                   Quản lý và theo dõi các đặt chỗ của bạn
//                 </p>
//               </div>
//             </Col>
//           </Row>

//           <Row>
//             <Col lg={10} md={10} xs={12} className="offset-lg-1 offset-md-1">
//               <div>
//                 {loading ? (
//                   <div style={{ textAlign: 'center', padding: '40px 20px' }}>Đang tải dữ liệu...</div>
//                 ) : error ? (
//                   <div style={{ textAlign: 'center', padding: '40px 20px', color: '#dc2626' }}>{error}</div>
//                 ) : bookingsData.length === 0 ? (
//                   <div style={{
//                     background: '#ffffff',
//                     border: '2px dashed #e5e7eb',
//                     borderRadius: '16px',
//                     padding: '60px 40px',
//                     textAlign: 'center'
//                   }}>
//                     <div style={{
//                       width: '80px',
//                       height: '80px',
//                       background: 'linear-gradient(135deg, rgb(225, 29, 72) 0%, rgb(190, 24, 61) 100%)',
//                       borderRadius: '50%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       margin: '0 auto 24px',
//                       boxShadow: '0 10px 30px rgba(225, 29, 72, 0.2)'
//                     }}>
//                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                         <line x1="16" y1="2" x2="16" y2="6"></line>
//                         <line x1="8" y1="2" x2="8" y2="6"></line>
//                         <line x1="3" y1="10" x2="21" y2="10"></line>
//                       </svg>
//                     </div>
//                     <p style={{
//                       fontSize: '1.25rem',
//                       color: '#1f2937',
//                       fontWeight: '600',
//                       marginBottom: '8px'
//                     }}>
//                       Chưa có đặt chỗ nào
//                     </p>
//                     <p style={{
//                       color: '#6b7280',
//                       fontSize: '0.95rem',
//                       margin: 0
//                     }}>
//                       Bạn chưa thực hiện đặt chỗ nào. Hãy bắt đầu đặt chỗ ngay hôm nay!
//                     </p>
//                   </div>
//                 ) : (
//                   bookingsData.map((b) => (
//                     <div key={b.bookingID} style={{
//                       marginBottom: '24px',
//                       borderRadius: '12px',
//                       border: '1px solid #f3f4f6',
//                       transition: 'all 0.3s ease',
//                       background: '#ffffff'
//                     }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.boxShadow = '0 8px 24px rgba(225, 29, 72, 0.12)'
//                         e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.3)'
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
//                         e.currentTarget.style.borderColor = '#f3f4f6'
//                       }}>
//                       <BookingCard
//                         booking={b}
//                         onConfirm={handleConfirm}
//                         onCancel={handleCancel}
//                         onTransfer={handleTransfer}
//                         onOpenContract={handleOpenContract}
//                         onReview={handleReview}
//                         onViewContract={handleViewContract}
//                       />
//                     </div>
//                   ))
//                 )}
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//       <ScrollToTopButton />
//       <Footer />
//     </>
//   )
// }

// export default BookingListPage