import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function LoginPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const login = async () => {
    if (!email) {
      navigate("/");
      return;
    }

    if (!password) {
      setError("Enter your password to sign in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, null, {
        params: { email, password },
      });

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("user_email", email);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-shell--center">
      <div className="auth-box">
        <span className="eyebrow">Welcome back</span>
        <h2>Sign in to ZenCue</h2>
        <p className="muted-text">Using {email || "your saved email"}.</p>

        <label className="field-label">Password</label>
        <input
          className="input"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? <p className="status-message status-message--error">{error}</p> : null}

        <button className="button" onClick={login} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="inline-note">
          Need a different email? <Link to="/">Go back</Link>
        </p>
      </div>
    </div>
  );
}
