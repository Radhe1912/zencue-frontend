import { useState } from "react";
import Reminder from "./Reminder";
import ReminderList from "./ReminderList";
import "../App.css";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="dashboard">
      <h1 className="title">ZenCue Dashboard</h1>

      <Reminder refresh={refresh} />

      <ReminderList refreshKey={refreshKey} />
    </div>
  );
}