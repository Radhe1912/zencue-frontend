import { useState } from "react";
import axios from "axios";
import "../App.css";

export default function Reminder() {
  const [type, setType] = useState("minutes");
  const [minutes, setMinutes] = useState(30);
  const [time, setTime] = useState("09:00");
  const [day, setDay] = useState("1"); // Monday
  const [message, setMessage] = useState("");

  const generateCron = () => {
    if (type === "minutes") {
      return `*/${minutes} * * * *`;
    }

    if (type === "daily") {
      const [hour, minute] = time.split(":");
      return `${minute} ${hour} * * *`;
    }

    if (type === "weekly") {
      const [hour, minute] = time.split(":");
      return `${minute} ${hour} * * ${day}`;
    }
  };

  const createReminder = async () => {
  const user_id = localStorage.getItem("user_id");
  const cron = generateCron();

  await axios.post("http://localhost:8000/reminders/", {
    user_id,
    cron_expression: cron,
    message,
  });

  alert("Reminder Created");

  refresh();
};

  return (
    <div className="card">
      <h3>Create Reminder</h3>

      {/* TYPE SELECT */}
      <select
        className="input"
        onChange={(e) => setType(e.target.value)}
      >
        <option value="minutes">Every X Minutes</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>

      {/* MINUTES */}
      {type === "minutes" && (
        <input
          className="input"
          type="number"
          placeholder="Minutes (e.g. 30)"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
      )}

      {/* DAILY */}
      {type === "daily" && (
        <input
          className="input"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      )}

      {/* WEEKLY */}
      {type === "weekly" && (
        <>
          <select
            className="input"
            onChange={(e) => setDay(e.target.value)}
          >
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
            <option value="0">Sunday</option>
          </select>

          <input
            className="input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </>
      )}

      {/* MESSAGE */}
      <input
        className="input"
        placeholder="Reminder message"
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className="button" onClick={createReminder}>
        Add Reminder
      </button>
    </div>
  );
}