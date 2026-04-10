import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const sendOTP = async () => {
    const res = await axios.post(`${BACKEND_URL}/auth/send-otp`, null, {
      params: { email },
    });

    localStorage.setItem("email", email);

    if (res.data.is_existing) {
      navigate("/login-password");
    } else {
      navigate("/verify");
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2>ZenCue Login</h2>

        <input
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={sendOTP}>Send OTP</button>
      </div>
    </div>
  );
}