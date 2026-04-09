import { useEffect, useState } from "react";
import axios from "axios";
import Reminder from "./Reminder";
import ReminderList from "./ReminderList";
import "../App.css";

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const user_id = localStorage.getItem("user_id");

  const fetchReminders = async () => {
    const res = await axios.get(
      `http://localhost:8000/reminders/user/${user_id}`
    );
    setReminders(res.data);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="title">ZenCue Dashboard</h1>

      <Reminder refresh={fetchReminders} />

      <ReminderList
        reminders={reminders}
        refresh={fetchReminders}
      />
    </div>
  );
}