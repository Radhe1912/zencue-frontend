import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";

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

function NotificationPopup({ onEnable, onClose }) {
  return (
    <div className="notification-popup">
      <div className="popup-content">
        <h2>Enable Notifications</h2>
        <p>Stay updated with reminders by enabling browser notifications.</p>
        <button className="button" onClick={onEnable}>
          Enable Notifications
        </button>
        <button className="button button--secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function App() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (Notification.permission === "default") {
      setShowPopup(true);
    } else if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  const enableNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
    }
    setShowPopup(false);
  };

  return (
    <HashRouter>
      {showPopup && (
        <NotificationPopup
          onEnable={enableNotifications}
          onClose={() => setShowPopup(false)}
        />
      )}
      <Routes>
        <Route path="/" element={<PublicRoute element={<Login />} />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
