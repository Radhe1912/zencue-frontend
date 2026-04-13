import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const verify = async () => {
    if (!email) {
      navigate("/");
      return;
    }

    if (!otp || !password) {
      setError("Enter the verification code and create your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, null, {
        params: { email, otp, password },
      });

      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("user_email", email);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-shell--center">
      <div className="auth-box">
        <span className="eyebrow">New account setup</span>
        <h2>Verify once to activate your account</h2>
        <p className="muted-text">
          We only ask for OTP during first-time account setup for {email || "your email"}.
        </p>

        <label className="field-label">Verification code</label>
        <input
          className="input"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <label className="field-label">Create password</label>
        <input
          className="input"
          type="password"
          placeholder="Set a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? <p className="status-message status-message--error">{error}</p> : null}

        <button className="button" onClick={verify} disabled={loading}>
          {loading ? "Verifying..." : "Create account"}
        </button>

        <p className="inline-note">
          Already have an account? <Link to="/">Use a different email</Link>
        </p>
      </div>
    </div>
  );
}
