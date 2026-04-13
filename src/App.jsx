import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import LoginPassword from "./pages/LoginPassword";

function hasStoredAuth() {
  const userId = localStorage.getItem("user_id");
  return Boolean(userId && userId.length > 20);
}

function ProtectedRoute() {
  return hasStoredAuth() ? <Outlet /> : <Navigate to="/" replace />;
}

function PublicRoute({ element }) {
  return hasStoredAuth() ? <Navigate to="/dashboard" replace /> : element;
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
