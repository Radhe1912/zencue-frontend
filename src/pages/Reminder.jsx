import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "../App.css";

const reminderTypeOptions = [
  { value: "water", label: "Water", icon: "💧", description: "Hydration nudges" },
  { value: "posture", label: "Posture", icon: "🪑", description: "Alignment resets" },
  { value: "motivation", label: "Motivation", icon: "🚀", description: "Momentum boosts" },
  { value: "custom", label: "Custom", icon: "✍️", description: "Your own message" },
];

const scheduleOptions = [
  { value: "minutes", label: "Every X min" },
  { value: "once", label: "Specific date" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const weekdayOptions = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function getCurrentDate() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function formatErrorMessage(error) {
  if (typeof error === "string") {
    return error;
  }
  if (Array.isArray(error)) {
    return error.map((err) => {
      if (typeof err === "object" && err.msg) {
        return `${err.loc?.join(" > ") || "Field"}: ${err.msg}`;
      }
      return JSON.stringify(err);
    }).join("; ");
  }
  if (typeof error === "object") {
    return JSON.stringify(error);
  }
  return "An unknown error occurred.";
}

export default function Reminder({ refresh }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduleType, setScheduleType] = useState("minutes");
  const [minutes, setMinutes] = useState(30);
  const [time, setTime] = useState("09:00");
  const [weekday, setWeekday] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [month, setMonth] = useState("1");
  const [yearlyDay, setYearlyDay] = useState("1");
  const [specificDate, setSpecificDate] = useState(getCurrentDate());
  const [reminderType, setReminderType] = useState("water");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const selectedType = useMemo(() => reminderTypeOptions.find((option) => option.value === reminderType), [reminderType]);

  const schedulePreview = useMemo(() => {
    switch (scheduleType) {
      case "minutes":
        return `Every ${minutes} minute${Number(minutes) === 1 ? "" : "s"}`;
      case "once":
        return `On ${specificDate} at ${time}`;
      case "daily":
        return `Every day at ${time}`;
      case "weekly": {
        const day = weekdayOptions.find((option) => option.value === weekday)?.label;
        return `Every ${day} at ${time}`;
      }
      case "monthly":
        return `Every month on day ${dayOfMonth} at ${time}`;
      case "yearly": {
        const monthName = monthOptions.find((option) => option.value === month)?.label;
        return `Every year on ${monthName} ${yearlyDay} at ${time}`;
      }
      default:
        return "";
    }
  }, [dayOfMonth, minutes, month, scheduleType, specificDate, time, weekday, yearlyDay]);

  const generateSchedule = () => {
    const [hour, minute] = time.split(":");

    if (scheduleType === "minutes") {
      const value = Number(minutes);
      if (!value || value < 1) {
        throw new Error("Minutes must be at least 1.");
      }
      return `*/${value} * * * *`;
    }

    if (scheduleType === "once") {
      return `ONCE|${specificDate}T${time}:00`;
    }

    if (scheduleType === "daily") {
      return `${minute} ${hour} * * * *`;
    }

    if (scheduleType === "weekly") {
      return `${minute} ${hour} * * ${weekday} *`;
    }

    if (scheduleType === "monthly") {
      return `${minute} ${hour} ${dayOfMonth} * * *`;
    }

    if (scheduleType === "yearly") {
      return `${minute} ${hour} ${yearlyDay} ${month} * *`;
    }

    throw new Error("Unsupported schedule type.");
  };

  const createReminder = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    if (reminderType === "custom" && !message.trim()) {
      setError("Enter a custom message for this reminder.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const schedule = generateSchedule();

      await axios.post(`${BACKEND_URL}/reminders/`, {
        user_id: userId,
        cron_expression: schedule,
        message: reminderType === "custom" ? message.trim() : "",
        reminder_type: reminderType,
      });

      setMessage("");
      setSuccess("Reminder created successfully.");
      refresh();
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || "Error creating reminder.";
      setError(formatErrorMessage(errorDetail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card composer-card composer-card--dashboard">
      {!notificationsEnabled ? (
        <div>
          <p>Please enable notifications to add reminders.</p>
        </div>
      ) : (
        <div>
          <div className="composer-topbar">
            <div>
              <span className="eyebrow">Create reminder</span>
              <h2>Fast setup, less scrolling.</h2>
            </div>
            <div className="composer-pill">
              <span>{selectedType?.icon}</span>
              <div>
                <strong>{selectedType?.label}</strong>
                <small>{schedulePreview}</small>
              </div>
            </div>
          </div>

          <div className="composer-shell">
            <div className="composer-pane composer-pane--types">
              <div className="mini-heading">
                <h3>Type</h3>
                <p>Pick the kind of reminder.</p>
              </div>

              <div className="type-grid type-grid--compact">
                {reminderTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`type-card ${reminderType === option.value ? "type-card--active" : ""}`}
                    onClick={() => setReminderType(option.value)}
                  >
                    <span className="type-card__icon">{option.icon}</span>
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="composer-pane composer-pane--schedule">
              <div className="mini-heading">
                <h3>Schedule</h3>
                <p>Choose when the push notification should fire.</p>
              </div>

              <div className="segment-row">
                {scheduleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`segment-chip ${scheduleType === option.value ? "segment-chip--active" : ""}`}
                    onClick={() => setScheduleType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="quick-fields">
                {scheduleType === "minutes" ? (
                  <div className="field-card field-card--single">
                    <label className="field-label">Repeat every</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      placeholder="Minutes"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                  </div>
                ) : null}

                {scheduleType === "once" ? (
                  <>
                    <div className="field-card">
                      <label className="field-label">Date</label>
                      <input
                        className="input"
                        type="date"
                        value={specificDate}
                        onChange={(e) => setSpecificDate(e.target.value)}
                      />
                    </div>
                    <div className="field-card">
                      <label className="field-label">Time</label>
                      <input
                        className="input"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}

                {scheduleType === "daily" ? (
                  <div className="field-card field-card--single">
                    <label className="field-label">Time</label>
                    <input
                      className="input"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                ) : null}

                {scheduleType === "weekly" ? (
                  <>
                    <div className="field-card">
                      <label className="field-label">Day</label>
                      <select className="input" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                        {weekdayOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field-card">
                      <label className="field-label">Time</label>
                      <input
                        className="input"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}

                {scheduleType === "monthly" ? (
                  <>
                    <div className="field-card">
                      <label className="field-label">Day of month</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="31"
                        value={dayOfMonth}
                        onChange={(e) => setDayOfMonth(e.target.value)}
                      />
                    </div>
                    <div className="field-card">
                      <label className="field-label">Time</label>
                      <input
                        className="input"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}

                {scheduleType === "yearly" ? (
                  <>
                    <div className="field-card">
                      <label className="field-label">Month</label>
                      <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
                        {monthOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field-card">
                      <label className="field-label">Day</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="31"
                        value={yearlyDay}
                        onChange={(e) => setYearlyDay(e.target.value)}
                      />
                    </div>
                    <div className="field-card field-card--single">
                      <label className="field-label">Time</label>
                      <input
                        className="input"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              {reminderType === "custom" ? (
                <div className="field-card field-card--custom">
                  <label className="field-label">Custom message</label>
                  <textarea
                    className="input input--textarea input--compact"
                    placeholder="Write the exact reminder you want to receive."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              ) : null}

              {error ? <p className="status-message status-message--error">{typeof error === "string" ? error : formatErrorMessage(error)}</p> : null}
              {success ? <p className="status-message status-message--success">{success}</p> : null}
              <p className="inline-note">
                Reminders are delivered as browser push notifications on devices where you enable them.
              </p>

              <button className="button composer-button" onClick={createReminder} disabled={loading}>
                {loading ? "Saving reminder..." : "Add reminder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
