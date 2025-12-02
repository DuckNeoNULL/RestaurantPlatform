import React, { useEffect } from "react";
import AppRoutes from "./routes";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/theme.css";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./redux/slices/authSlice";
function App() {
  const dispatch = useDispatch();

  // Hydrate user from HttpOnly cookie on first mount
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;