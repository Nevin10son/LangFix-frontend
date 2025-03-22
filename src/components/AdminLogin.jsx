import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await axios.post("http://localhost:5000/adminSignIn", {
        email,
        password,
      });

      localStorage.setItem("adminToken", response.data.token);
      navigate("/admindashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="adminPage">
      <div className="adminLoginCard">
        <div className="adminHeader">
          <h2 className="adminTitle">Admin Login</h2>
        </div>
        {error && <p className="adminError">{error}</p>}
        <form onSubmit={handleLogin} className="adminForm">
          <div className="adminInputGroup">
            <input
              type="text"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="adminInput"
              required
            />
          </div>
          <div className="adminInputGroup">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="adminInput"
              required
            />
          </div>
          <div className="adminButtonContainer">
            <button type="submit" className="adminButton">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}