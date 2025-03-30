import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const inputHandler = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const readValue = () => {
    setLoading(true);
    axios.post('http://localhost:5000/login', input)
      .then((response) => {
        if (response.data.Status === "invalid Emailid") {
          showAlert('Email not found', 'error');
        } else if (response.data.Status === 'Incorrect Password') {
          showAlert('Incorrect password', 'error');
        } else {
          let token = response.data.token;
          let userid = response.data.userid;
          let name = response.data.name;

          sessionStorage.setItem("token", token);
          sessionStorage.setItem("userid", userid);
          sessionStorage.setItem("name", name);

          showAlert('Login successful!', 'success');
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      })
      .catch((error) => {
        showAlert('An error occurred. Please try again.', 'error');
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    readValue();
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="login-page">
      {alert && (
        <motion.div 
          className={`alert alert-${alert.type}`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
        >
          {alert.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{alert.message}</span>
          <button className="alert-close" onClick={() => setAlert(null)}>×</button>
        </motion.div>
      )}

      <div className="login-wrapper">
        <motion.div 
          className="login-left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-left-content">
            <h1>Welcome to LangFix</h1>
            <p className="tagline">Sign in to continue your language learning journey</p>
            
            <div className="login-features">
              <motion.div 
                className="feature-item"
                custom={0}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="feature-icon"></div>
                <div className="feature-text">
                  <strong>Resume your personalized learning path</strong>
                </div>
              </motion.div>
              <motion.div 
                className="feature-item"
                custom={1}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="feature-icon"></div>
                <div className="feature-text">
                  <strong>Access your saved exercises and progress</strong>
                </div>
              </motion.div>
              <motion.div 
                className="feature-item"
                custom={2}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="feature-icon"></div>
                <div className="feature-text">
                  <strong>Continue building your language skills</strong>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="login-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 className="login-title" variants={itemVariants}>
            Welcome Back
          </motion.h2>
          
          <motion.p className="login-subtitle" variants={itemVariants}>
            Please sign in to your account
          </motion.p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <motion.div className="form-group" variants={itemVariants}>
              <div className="input-icon">
                <Mail size={18} color="#94a3b8" />
              </div>
              <input
                type="email"
                name="email"
                value={input.email}
                onChange={inputHandler}
                className="login-input"
                placeholder="Email Address"
                required
              />
            </motion.div>
            
            <motion.div className="form-group" variants={itemVariants}>
              <div className="input-icon">
                <Lock size={18} color="#94a3b8" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={input.password}
                onChange={inputHandler}
                className="login-input"
                placeholder="Password"
                required
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </motion.div>

            <motion.div className="login-options" variants={itemVariants}>
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </motion.div>
            
            <motion.button
              type="submit"
              className="login-button"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
            
            <motion.div className="signup-link" variants={itemVariants}>
              Don't have an account? <Link to="/">Sign up</Link>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;