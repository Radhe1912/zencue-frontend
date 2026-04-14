import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const submitAuth = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "create" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "create" ? "/auth/register" : "/auth/login";
      const res = await axios.post(`${BACKEND_URL}${endpoint}`, {
        email: email.trim(),
        password,
      });

      localStorage.setItem("email", email.trim());
      localStorage.setItem("user_email", email.trim());
      localStorage.setItem("user_id", res.data.user_id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">ZenCue</span>
          <h1>Gentle reminders that actually fit your routine.</h1>
          <p>
            Create an account with email and password, then turn on browser notifications for
            this device. ZenCue now delivers reminders with web push instead of email verification.
          </p>
        </div>

        <div className="auth-box auth-box--wide">
          <h2>{mode === "create" ? "Create your account" : "Sign in to ZenCue"}</h2>
          <p className="muted-text">
            Use the same email and password each time. After you sign in, enable notifications
            once and reminders will start landing in this browser.
          </p>

          <div className="segment-row auth-mode-switch">
            <button
              className={`segment-chip ${mode === "signin" ? "segment-chip--active" : ""}`}
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
            >
              Sign in
            </button>
            <button
              className={`segment-chip ${mode === "create" ? "segment-chip--active" : ""}`}
              type="button"
              onClick={() => {
                setMode("create");
                setError("");
              }}
            >
              Create account
            </button>
          </div>

          <label className="field-label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            placeholder={mode === "create" ? "Create a password" : "Enter password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === "create" ? (
            <>
              <label className="field-label">Confirm password</label>
              <input
                className="input"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          ) : null}

          {error ? <p className="status-message status-message--error">{error}</p> : null}

          <button className="button" onClick={submitAuth} disabled={loading}>
            {loading ? "Working..." : mode === "create" ? "Create account" : "Sign in"}
          </button>
        </div>
      </section>
    </div>
  );
}
