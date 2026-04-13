import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const sendOTP = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/auth/send-otp`, null, {
        params: { email: email.trim() },
      });

      localStorage.setItem("email", email.trim());

      if (res.data.is_existing) {
        navigate("/login-password");
      } else {
        navigate("/verify");
      }
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
            Sign in if you already have an account. If you are new, we will send a
            one-time verification code to finish setup.
          </p>
        </div>

        <div className="auth-box auth-box--wide">
          <h2>Continue with email</h2>
          <p className="muted-text">
            Existing users go straight to password login. New users verify once and then
            sign in normally after that.
          </p>

          <label className="field-label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error ? <p className="status-message status-message--error">{error}</p> : null}

          <button className="button" onClick={sendOTP} disabled={loading}>
            {loading ? "Checking account..." : "Continue"}
          </button>
        </div>
      </section>
    </div>
  );
}
