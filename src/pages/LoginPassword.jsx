import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function LoginPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const login = async () => {
    const res = await axios.post("http://localhost:8000/auth/login", null, {
      params: { email, password },
    });

    if (res.data.user_id) {
      localStorage.setItem("user_id", res.data.user_id);
      navigate("/dashboard");
    } else {
      alert("Wrong password");
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2>Enter Password</h2>

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}