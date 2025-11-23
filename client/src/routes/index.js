import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/landingPage/LandingPage";
import SignUpCustomer from "../pages/auth/SignUpCustomerPage";
import LoginPage from "../pages/auth/LoginPage";
import SignUpOwner from "../pages/auth/SignUpOwnerPage";
import RestaurantDetailsPage from "../pages/restaurant/restaurantDetails/RestaurantDetailsPage";
import PartnerDashboard from "../pages/partner/dashboard/Dashboard";
import ProfileBusiness from "../pages/partner/Profile";
import Restaurants from "../pages/partner/restaurant/RestaurantListPage";
import RestaurantCreatePage from "../pages/partner/restaurant/RestaurantCreatePage";
import HallDetailPage from "../pages/partner/restaurant/HallDetailPage";
import RestaurantDetail from "../pages/partner/restaurant/RestaurantDetails";
import HallCreate from "../pages/partner/restaurant/HallCreatePage";
import PartnerBookingPage from "../pages/partner/booking/PartnerBookingPage";
import HallSchedulePage from "../pages/partner/restaurant/HallSchedulePage";
import BookingDetailPage from "../pages/partner/booking/BookingDetailPage";
import ContractPage from "../pages/partner/booking/ContractPage";
import PartnerPaymentPage from "../pages/partner/payment/PartnerPaymentPage";
import PartnerPayoutPage from "../pages/partner/payment/PartnerPayoutPage";
import Notification from "../pages/partner/Notification";
import PartnerReviewPage from "../pages/partner/review/PartnerReviewPage";
import NegotiationPage from "../pages/partner/NegotiationPage";
import SearchResultList from "../pages/customer/SearchResultList";
// import BookingForm from "../pages/auth/BookingForm";

/*Admin Routes */
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import UserList from "../pages/admin/management/user/UserList";
import UserDetail from "../pages/admin/management/user/UserDetails";
import AdminRestaurantDetail from "../pages/admin/management/restaurant/AdminRestaurantDetail";
import BookingList from "../pages/admin/management/booking/BookingList";
import BookingListDetail from "../pages/admin/management/booking/BookingListDetail";
import AdminProfilePage from "../pages/admin/Profile";
import AdminLicensePage from "../pages/admin/management/license/AdminLicensePage";
import AdminRestaurantList from "../pages/admin/management/restaurant/AdminRestaurantList";
import AdminPaymentListPage from "../pages/admin/management/payment/AdminPaymentListPage";
import AdminPaymentDetail from "../pages/admin/management/payment/AdminPaymentDetail";
import AdminReviewListPage from "../pages/admin/management/review/ReviewList";
import AdminReportListPage from "../pages/admin/management/report/ReportList";

import BookingListPage from "../pages/customer/bookingForm/BookingListPage";
// import BookingForm from "../pages/customer/BookingForm";
import Profile from "../pages/customer/Profile";
import PaymentPage from "../pages/customer/payment/PaymentPage";
import PaymentSuccessPage from "../pages/customer/payment/PaymentSuccessPage";
import PaymentFailedPage from "../pages/customer/payment/PaymentFailedPage";
import BookingDetailsPage from "../pages/customer/booking/BookingDetails/BookingDetailsPage";
import BookingPage from "../pages/customer/bookingForm/BookingPage";
import AdminNegotiationPage from "../pages/admin/management/license/AdminNegotiationPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup/customer" element={<SignUpCustomer />} />
        <Route path="/signup/partner" element={<SignUpOwner />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
        {/* Alias to support existing links using singular path */}
        <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
        <Route path="/partner" element={<PartnerDashboard />} />
        <Route path="/partner/negotiation" element={<NegotiationPage />} />
        {/* <Route path="/partner/profile" element={<ProfileBusiness />} /> */}
        <Route path="/partner/restaurants" element={<Restaurants />} />
        <Route
          path="/partner/restaurants/new"
          element={<RestaurantCreatePage />}
        />
        <Route
          path="/partner/restaurants/detail/:id"
          element={<RestaurantDetail />}
        />
        <Route path="/partner/halls/detail/:id" element={<HallDetailPage />} />
        <Route path="/partner/halls/new" element={<HallCreate />} />
        <Route path="/partner/hall-schedule" element={<HallSchedulePage />} />
        <Route path="/partner/bookings" element={<PartnerBookingPage />} />
        <Route path="/partner/profile" element={<ProfileBusiness />} />
        <Route path="/partner/bookings/:id" element={<BookingDetailPage />} />
        <Route
          path="/partner/bookings/:id/contract"
          element={<ContractPage />}
        />
        <Route path="/partner/payments" element={<PartnerPaymentPage />} />
        <Route path="/partner/payouts" element={<PartnerPayoutPage />} />
        <Route path="/partner/reviews" element={<PartnerReviewPage />} />
        <Route path="/partner/notifications" element={<Notification />} />

        <Route path="/customer/bookings" element={<BookingListPage />} />
        <Route path="/bookingForm" element={<BookingPage />} />
        <Route path="/customer/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/users/:id" element={<UserDetail />} />
        <Route path="/admin/restaurants" element={<AdminRestaurantList />} />
        <Route path="/admin/restaurants/:id" element = {<AdminRestaurantDetail/>}/>
        <Route path="/admin/bookings" element={<BookingList />} />
        <Route path="/admin/bookings/:id" element={<BookingListDetail />} />
        <Route path="/admin/license" element={<AdminLicensePage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/payments" element={<AdminPaymentListPage />} />
        <Route path="/admin/payments/:id" element={<AdminPaymentDetail />} />
        <Route path="/admin/reviews" element={<AdminReviewListPage />} />
        <Route path="/admin/reports" element={<AdminReportListPage />} />
        <Route path="/admin/negotiation/:id" element={<AdminNegotiationPage />} />


        {/* Booking Routes */}
        <Route path="/booking/:bookingId" element={<BookingDetailsPage />} />
        <Route
          path="/booking/:bookingId/contract"
          element={<BookingDetailsPage />}
        />
        <Route
          path="/booking/:bookingId/payments"
          element={<BookingDetailsPage />}
        />

        {/* Payment Routes */}
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route path="/payment/new" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />

        {/* Thêm các route khác tại đây */}
        <Route path="/searchresult" element={<SearchResultList />} />
        {/* <Route path="/auth/bookingform" element={<BookingForm />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;