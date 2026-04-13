import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import "../App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const weekdayLabels = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
};

const monthLabels = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

const reminderIcons = {
  water: "💧",
  posture: "🪑",
  motivation: "🚀",
  custom: "✍️",
};

function formatTime(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatSchedule(schedule) {
  if (!schedule) return "Schedule unavailable";

  if (schedule.startsWith("ONCE|")) {
    const rawDate = schedule.split("|")[1];
    return `One time on ${rawDate.replace("T", " ").slice(0, 16)}`;
  }

  const parts = schedule.split(" ");
  if (parts.length < 5) return schedule;

  if (parts[0].startsWith("*/")) {
    return `Every ${parts[0].replace("*/", "")} minutes`;
  }

  const [minute, hour, day, month, weekday] = parts;
  const timeLabel = formatTime(hour, minute);

  if (month !== "*" && day !== "*") {
    return `Every year on ${monthLabels[month] || month} ${day} at ${timeLabel}`;
  }

  if (day !== "*" && month === "*") {
    return `Every month on day ${day} at ${timeLabel}`;
  }

  if (weekday !== "*") {
    return `Every ${weekdayLabels[weekday] || weekday} at ${timeLabel}`;
  }

  return `Every day at ${timeLabel}`;
}

function formatReminderTitle(reminder) {
  if (reminder.message && reminder.message.trim()) {
    return reminder.message;
  }

  if (reminder.reminder_type) {
    return `${reminder.reminder_type[0].toUpperCase()}${reminder.reminder_type.slice(1)} reminder`;
  }

  return "Reminder";
}

export default function ReminderList({ refreshKey }) {
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("user_id");

  const fetchReminders = async () => {
    if (!userId) {
      setReminders([]);
      return;
    }

    try {
      const res = await axios.get(`${BACKEND_URL}/reminders/user/${userId}`);
      setReminders(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load reminders.");
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [refreshKey]);

  const activeCount = useMemo(
    () => reminders.filter((reminder) => reminder.active).length,
    [reminders]
  );

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

  return (
    <section className="card reminder-list-card reminder-list-card--dashboard">
      <div className="list-topbar">
        <div>
          <span className="eyebrow">Your reminders</span>
          <h2>Everything active, paused, and ready to manage.</h2>
        </div>

        <div className="list-stats">
          <div className="stat-chip">
            <strong>{reminders.length}</strong>
            <span>Total</span>
          </div>
          <div className="stat-chip stat-chip--active">
            <strong>{activeCount}</strong>
            <span>Active</span>
          </div>
        </div>
      </div>

      {error ? <p className="status-message status-message--error">{error}</p> : null}

      {reminders.length === 0 ? (
        <div className="empty-state empty-state--dashboard">
          <h3>No reminders yet</h3>
          <p>Create your first reminder on the left and it will show up here instantly.</p>
        </div>
      ) : (
        <div className="reminder-stack reminder-stack--dashboard">
          {reminders.map((reminder) => (
            <article className="reminder-item reminder-item--dashboard" key={reminder.id}>
              <div className="reminder-badge">
                {reminderIcons[reminder.reminder_type] || "⏰"}
              </div>

              <div className="reminder-left">
                <strong>{formatReminderTitle(reminder)}</strong>
                <span>{formatSchedule(reminder.cron_expression)}</span>
              </div>

              <div className="reminder-meta">
                <span className={`status-dot ${reminder.active ? "status-dot--active" : ""}`}>
                  {reminder.active ? "Active" : "Paused"}
                </span>

                <div className="reminder-actions">
                  {reminder.active ? (
                    <button className="button button--small" onClick={() => stopReminder(reminder.id)}>
                      Pause
                    </button>
                  ) : (
                    <button className="button button--small" onClick={() => startReminder(reminder.id)}>
                      Resume
                    </button>
                  )}

                  <button
                    className="button button--small button--danger"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
