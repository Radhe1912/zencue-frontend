import axios from "axios";
import { useEffect, useState } from "react";
import "../App.css";

export default function ReminderList({ refreshKey }) {
  const [reminders, setReminders] = useState([]);
  const user_id = localStorage.getItem("user_id");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const fetchReminders = async () => {
    const res = await axios.get(`${BACKEND_URL}/reminders/user/${user_id}`);
    setReminders(res.data);
  };

  useEffect(() => {
    fetchReminders();
  }, [refreshKey]);

  const stopReminder = async (id) => {
    await axios.post(`${BACKEND_URL}/reminders/stop/${id}`);
    fetchReminders();
  };

  const startReminder = async (id) => {
    await axios.post(`${BACKEND_URL}/reminders/start/${id}`);
    fetchReminders();
  };

  const deleteReminder = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;

    await axios.delete(`${BACKEND_URL}/reminders/${id}`);
    fetchReminders();
  };

  const formatCron = (cron) => {
    if (cron.startsWith("*/")) {
      return `Every ${cron.split("/")[1].split(" ")[0]} min`;
    }

    const [m, h, , , d] = cron.split(" ");

    if (d !== "*") return `Weekly at ${h}:${m}`;

    return `Daily at ${h}:${m}`;
  };

  return (
    <div className="card">
      <h3>Your Reminders</h3>

      {reminders.length === 0 ? (
        <p>No reminders yet</p>
      ) : (
        reminders.map((r) => (
          <div className="reminder-item" key={r.id}>
            <div className="reminder-left">
              <strong>
                {r.message && r.message.trim() !== ""
                  ? `Custom: ${r.message}`
                  : r.reminder_type
                  ? `${r.reminder_type?.toUpperCase()} reminder`
                  : "Reminder"}
              </strong>
              <span>{formatCron(r.cron_expression)}</span>
            </div>

            <div className="reminder-actions">
              {r.active ? (
                <button onClick={() => stopReminder(r.id)}>
                  Stop
                </button>
              ) : (
                <button onClick={() => startReminder(r.id)}>
                  Start
                </button>
              )}

              <button onClick={() => deleteReminder(r.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}