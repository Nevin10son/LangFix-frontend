import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputHandler = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const readValue = () => {
    setLoading(true);
    axios.post('http://localhost:5000/login', input)
      .then((response) => {
        if (response.data.Status === "invalid Emailid") {
          alert('Email not found');
        } else if (response.data.Status === 'Incorrect Password') {
          alert('Incorrect password');
        } else {
          let token = response.data.token;
          let userid = response.data.userid;
          let name = response.data.name;

          sessionStorage.setItem("token", token);
          sessionStorage.setItem("userid", userid);
          sessionStorage.setItem("name", name);

          navigate('/dashboard');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    readValue();
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-left">
          <motion.div
            className="brand"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="logo"></div>
            <h2>Welcome Back</h2>
          </motion.div>
          <div className="login-art"></div>
        </div>

        <div className="login-right">
          <motion.div
            className="login-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1>Login</h1>
            <p>Access your account</p>
          </motion.div>

          <form className="login-form" onSubmit={handleSubmit}>
            <motion.div
              className="form-group"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon email-icon"></span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={input.email}
                  onChange={inputHandler}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="form-group"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="password-label-group">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-password">Forgot?</Link>
              </div>
              <div className="input-wrapper">
                <span className="input-icon password-icon"></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={input.password}
                  onChange={inputHandler}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="visibility-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className={showPassword ? 'eye-closed' : 'eye-open'}></span>
                </button>
              </div>
            </motion.div>

            <motion.div
              className="remember-me"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
            </motion.div>

            <motion.button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </motion.button>
          </form>

          <motion.div
            className="signup-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p>Don't have an account? <Link to="/">Sign up</Link></p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;