import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Alert from './Alert'; // Import the new Alert component
import './Signup.css';

const UserSignup = () => {
  const [input, setInput] = useState({
    name: '',
    email: '',
    password: '',
    cpassword: ''
  });
  const [alert, setAlert] = useState(null); // State to manage alert
  const navigate = useNavigate();

  const inputHandler = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000); // Auto-close after 3 seconds
  };

  const readValue = () => {
    if (input.password !== input.cpassword) {
      showAlert('Passwords do not match', 'error');
      return;
    }

    const userData = {
      name: input.name,
      email: input.email,
      password: input.password
    };

    axios.post('http://localhost:5000/signup', userData)
      .then((response) => {
        if (response.data.Status === 'Success') {
          showAlert('Registered Successfully', 'success');
          setTimeout(() => navigate('/login'), 1500); // Navigate after alert
        } else if (response.data.Error === 'Email already exists') {
          showAlert('Email already exists', 'error');
        } else {
          showAlert('Registration failed', 'error');
        }
      })
      .catch((error) => {
        console.error(error);
        showAlert('An error occurred', 'error');
      });
  };

  const fields = ['name', 'email', 'password', 'cpassword'];

  return (
    <div className="signup-page">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <motion.div
        className="signup-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="signup-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Sign Up
        </motion.h1>
        <motion.div
          className="signup-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {fields.map((field, index) => (
            <motion.div
              className={`form-group ${input[field] ? 'filled' : ''}`}
              key={field}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <input
                type={field.includes('password') ? 'password' : 'text'}
                name={field}
                value={input[field]}
                onChange={inputHandler}
                className="signup-input"
                placeholder=" "
                required
              />
              <label className="floating-label">
                {field === 'cpassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            </motion.div>
          ))}
          <motion.button
            onClick={readValue}
            className="signup-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Register
          </motion.button>
          <motion.div
            className="signup-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Link to="/login">Already have an account? Login</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserSignup;