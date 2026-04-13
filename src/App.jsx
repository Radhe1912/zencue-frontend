import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import LoginPassword from "./pages/LoginPassword";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function ProtectedRoute() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setStatus("guest");
      return;
    }

    axios
      .get(`${BACKEND_URL}/auth/session/${userId}`)
      .then((res) => {
        localStorage.setItem("user_email", res.data.email);
        setStatus("authenticated");
      })
      .catch(() => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        setStatus("guest");
      });
  }, []);

  if (status === "loading") {
    return <div className="page-shell page-shell--center">Restoring your session...</div>;
  }

  if (status === "guest") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function PublicRoute({ element }) {
  const userId = localStorage.getItem("user_id");

  if (userId && userId.length > 20) {
    return <Navigate to="/dashboard" replace />;
  }

  if (userId) {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
  }

  return element;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute element={<Login />} />} />
        <Route path="/verify" element={<PublicRoute element={<VerifyOTP />} />} />
        <Route path="/login-password" element={<PublicRoute element={<LoginPassword />} />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
