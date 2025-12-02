import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as bookingActions from "../redux/slices/bookingSlice";
import { calculatePrice } from "../services/bookingService";


export function useBooking() {
  const dispatch = useDispatch();
  const booking = useSelector((s) => s.booking) || {};

  const setCustomerField = useCallback((key, value) => dispatch(bookingActions.setCustomerField({ key, value })), [dispatch]);
  const setBookingField = useCallback((key, value) => dispatch(bookingActions.setBookingField({ key, value })), [dispatch]);
  const setMenu = useCallback((menu) => dispatch(bookingActions.setMenu(menu)), [dispatch]);
  const setDishes = useCallback((dishes) => dispatch(bookingActions.setDishes(dishes)), [dispatch]);
  const setServices = useCallback((services) => dispatch(bookingActions.setServices(services)), [dispatch]);
  const toggleService = useCallback((svc) => dispatch(bookingActions.toggleService(svc)), [dispatch]);
  const applyPromotion = useCallback((p) => dispatch(bookingActions.applyPromotion(p)), [dispatch]);
  const fetchPromotions = useCallback((params) => dispatch(bookingActions.fetchPromotions(params)), [dispatch]);
  const setFinancial = useCallback((f) => dispatch(bookingActions.setFinancial(f)), [dispatch]);
  const hydrateFromDTO = useCallback((dto) => dispatch(bookingActions.hydrateFromDTO(dto)), [dispatch]);
  // Partner actions
  const loadPartnerBookings = useCallback((opts) => dispatch(bookingActions.loadPartnerBookings(opts)), [dispatch]);
  const acceptByPartner = useCallback((bookingID) => dispatch(bookingActions.acceptBookingByPartner(bookingID)), [dispatch]);
  const rejectByPartner = useCallback((bookingID, reason) => dispatch(bookingActions.rejectBookingByPartner({ bookingID, reason })), [dispatch]);
  const markCheckedLocal = useCallback((bookingID) => dispatch(bookingActions.markCheckedLocal(bookingID)), [dispatch]);
  // Detail loader
  const loadBookingDetail = useCallback((bookingID) => dispatch(bookingActions.loadBookingDetail(bookingID)), [dispatch]);
  const updateBooking = useCallback((bookingID, updates) => dispatch(bookingActions.updateBooking({ bookingID, updates })), [dispatch]);

  const recalcPrice = useCallback(() => {
    if (!booking) return { guests: 0, menuTotal: 0, servicesTotal: 0, subtotal: 0, discount: 0, vat: 0, total: 0 };
    const payload = {
      menu: booking.menu,
      tables: booking.bookingInfo?.tables,
      services: booking.services,
      promotion: booking.appliedPromotion,
      hallFee: booking.hall?.price || booking.bookingInfo?.hallPrice || 0,
    };
    const summary = calculatePrice(payload);
    dispatch(bookingActions.setPriceSummary(summary));
    return summary;
  }, [dispatch, booking.menu, booking.bookingInfo?.tables, booking.services, booking.appliedPromotion, booking.hall?.price, booking.bookingInfo?.hallPrice]);

  // Auto-recalculate whenever inputs change (menu, tables, services, promotion)
  useEffect(() => {
    recalcPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.menu, booking.bookingInfo?.tables, booking.services, booking.appliedPromotion, booking.hall?.price, booking.bookingInfo?.hallPrice]);

  // derived summary always available locally
  const summary = useMemo(() => {
    try {
      return booking.priceSummary || { guests: 0, menuTotal: 0, servicesTotal: 0, subtotal: 0, discount: 0, vat: 0, total: 0 };
    } catch {
      return { guests: 0, menuTotal: 0, servicesTotal: 0, subtotal: 0, discount: 0, vat: 0, total: 0 };
    }
  }, [booking.priceSummary]);

  const submit = useCallback(
    async (extra = {}) => {
      // If caller prepared a server-ready payload (flat IDs), send it as-is to avoid unknown-column errors server-side.
      const isServerShape =
        extra && (
          extra.customerID !== undefined ||
          extra.hallID !== undefined ||
          extra.menuID !== undefined ||
          extra.eventDate !== undefined
        );

      const payload = isServerShape
        ? extra
        : {
            customer: booking.customer,
            bookingInfo: booking.bookingInfo,
            menu: booking.menu,
            services: booking.services,
            promotion: booking.appliedPromotion,
            priceSummary: booking.priceSummary,
            ...extra,
          };

      const action = await dispatch(bookingActions.submitBooking(payload));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch, booking]
  );

  const clear = useCallback(() => dispatch(bookingActions.clearBooking()), [dispatch]);

  return {
    booking,
    // Booking form helpers
    setCustomerField,
    setBookingField,
    setMenu,
    setDishes,
    setServices,
    toggleService,
    applyPromotion,
    fetchPromotions,
    recalcPrice,
    summary,
    submit,
    setFinancial,
    hydrateFromDTO,
    clear,
    // Partner list helpers
    loadPartnerBookings,
    acceptByPartner,
    rejectByPartner,
    markCheckedLocal,
    loadBookingDetail,
    updateBooking,
    partnerBookings: booking.partnerRows || [],
    partnerStatus: booking.partnerStatus || 'idle',
    partnerError: booking.partnerError || null,
    bookingDetail: booking.detail || null,
    bookingDetailStatus: booking.detailStatus || 'idle',
    bookingDetailError: booking.detailError || null,
  };
}

export default useBooking;