import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  createPayOSCheckout,
  fetchPayOSStatus,
  clearCheckout,
  clearStatusInfo,
  selectPayment,
} from "../redux/slices/paymentSlice";

export default function usePayment() {
  const dispatch = useDispatch();
  const payment = useSelector(selectPayment);

  const startCheckout = useCallback((bookingID, buyer) => {
    return dispatch(createPayOSCheckout({ bookingID, buyer }));
  }, [dispatch]);

  const checkStatus = useCallback((orderCode) => {
    return dispatch(fetchPayOSStatus(orderCode));
  }, [dispatch]);

  const resetCheckout = useCallback(() => dispatch(clearCheckout()), [dispatch]);
  const resetStatus = useCallback(() => dispatch(clearStatusInfo()), [dispatch]);

  return {
    ...payment,
    startCheckout,
    checkStatus,
    resetCheckout,
    resetStatus,
  };
}
