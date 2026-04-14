import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Reminder from "./Reminder";
import ReminderList from "./ReminderList";
import PushNotificationsCard from "../components/PushNotificationsCard";
import "../App.css";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const email = localStorage.getItem("user_email");

  const refresh = () => setRefreshKey((prev) => prev + 1);

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="page-shell">
      <div className="dashboard dashboard--enhanced">
        <header className="dashboard-hero">
          <div className="dashboard-hero__copy">
            <span className="eyebrow">ZenCue dashboard</span>
            <h1 className="title">A smoother command center for your routines.</h1>
            <p className="muted-text">
              Signed in as {email || "your account"}. Enable push on this browser, create your
              reminders, and let ZenCue handle delivery without any email-based reminder flow.
            </p>
          </div>

          <div className="dashboard-hero__actions">
            <div className="hero-stat">
              <strong>Smart flow</strong>
              <span>Less scrolling, quicker setup, cleaner control.</span>
            </div>
            <button className="button button--secondary" onClick={logout}>
              Log out
            </button>
          </div>
        </header>

        <div className="dashboard-grid dashboard-grid--enhanced">
          <Reminder refresh={refresh} />
          <div className="dashboard-column">
            <PushNotificationsCard />
            <ReminderList refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
