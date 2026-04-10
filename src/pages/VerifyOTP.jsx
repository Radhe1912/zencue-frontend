import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const verify = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/verify-otp`,
        null,
        {
          params: { email, otp, password },
        }
      );

      localStorage.setItem("user_id", res.data.user_id);
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.detail || "Invalid OTP");
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2>Verify OTP</h2>

        <input
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />

        <input
          type="password"
          placeholder="Set Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={verify}>Verify</button>
      </div>
    </div>
  );
}