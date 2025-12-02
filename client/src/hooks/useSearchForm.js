import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setField as setFieldAction,
  setFields as setFieldsAction,
  resetSearch,
  selectSearch,
  performSearch as performSearchThunk,
} from "../redux/slices/searchSlice";

/**
 * useSearchForm hook
 */
export function useSearchForm() {
  const dispatch = useDispatch();
  const state = useSelector(selectSearch);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("searchForm");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch(setFieldsAction(parsed));
      } catch (e) {
        console.error("Failed to parse searchForm from sessionStorage", e);
      }
    }
  }, [dispatch]);

  const setField = useCallback(
    (key, value) => {
      if (key === "tables") value = value === "" ? "" : Number(value);
      dispatch(setFieldAction({ key, value }));
      // Save to sessionStorage
      const current = { ...state, [key]: value };
      sessionStorage.setItem("searchForm", JSON.stringify(current));
    },
    [dispatch, state]
  );

  const setFields = useCallback((obj) => {
    dispatch(setFieldsAction(obj));
    // Save to sessionStorage
    const current = { ...state, ...obj };
    sessionStorage.setItem("searchForm", JSON.stringify(current));
  }, [dispatch, state]);

  const reset = useCallback(() => {
    dispatch(resetSearch());
    sessionStorage.removeItem("searchForm");
  }, [dispatch]);

  const getQueryString = useCallback(() => {
    const qp = new URLSearchParams();

    // 🏙️ Vị trí
    if (state.location && state.location.trim() !== "") {
      qp.set("location", state.location);
    }

    // 📅 Ngày
    if (state.date) qp.set("date", state.date);

    // 🎉 Loại sự kiện
    if (state.eventType && state.eventType.trim() !== "") {
      qp.set("eventType", state.eventType);
    }

    // 🍽️ Số bàn (chỉ thêm nếu là số > 0)
    if (
      state.tables !== null &&
      state.tables !== undefined &&
      state.tables !== "" &&
      !isNaN(Number(state.tables)) &&
      Number(state.tables) > 0
    ) {
      qp.set("tables", String(state.tables));
    }

    // 🕒 Thời gian
    if (state.startTime) qp.set("startTime", state.startTime);
    if (state.endTime) qp.set("endTime", state.endTime);

    return qp.toString();
  }, [state]);

  const performSearch = useCallback(
    async (overrideParams = {}) => {
      const params = { ...state, ...overrideParams };
      console.log("🧠 performSearch sending params:", params);
      const action = await dispatch(performSearchThunk(params));
      if (action.error) throw action.payload || action.error.message;
      return action.payload;
    },
    [dispatch, state]
  );

  return { state, setField, setFields, reset, getQueryString, performSearch };
}

export default useSearchForm;
