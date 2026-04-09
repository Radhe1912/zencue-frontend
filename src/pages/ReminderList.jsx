import axios from "axios";
import { useEffect, useState } from "react";
import "../App.css";

export default function ReminderList() {
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

  const stopReminder = async (id) => {
    await axios.post(`http://localhost:8000/reminders/stop/${id}`);
    fetchReminders(); // ✅ refresh list
  };

  const formatCron = (cron) => {
    if (cron.startsWith("*/")) {
      return `Every ${cron.split("/")[1].split(" ")[0]} minutes`;
    }

    const parts = cron.split(" ");
    return `At ${parts[1]}:${parts[0]} daily`;
  };

  return (
    <div className="card">
      <h3>Your Reminders</h3>

      {reminders.length === 0 ? (
        <p>No reminders yet</p>
      ) : (
        reminders.map((r) => (
          <div key={r.id} style={{ marginBottom: "10px" }}>
            <strong>{r.message}</strong> <br />
            <small>{formatCron(r.cron_expression)}</small>

            <br />

            <button
              className="button stop"
              onClick={() => stopReminder(r.id)}
            >
              Stop
            </button>
          </div>
        ))
      )}
    </div>
  );
}