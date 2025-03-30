import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import './Signup.css';

const UserSignup = () => {
  const [input, setInput] = useState({
    name: '',
    email: '',
    password: '',
    cpassword: ''
  });
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validations, setValidations] = useState({
    name: { valid: false, touched: false },
    email: { valid: false, touched: false },
    password: { valid: false, touched: false },
    cpassword: { valid: false, touched: false }
  });
  const navigate = useNavigate();

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isLongEnough: false
  });

  const inputHandler = (event) => {
    const { name, value } = event.target;
    setInput({ ...input, [name]: value });
    
    // Mark field as touched
    setValidations(prev => ({
      ...prev,
      [name]: { ...prev[name], touched: true }
    }));
    
    // Validate fields
    validateField(name, value);
    
    // Special handling for password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    // Check if confirm password matches
    if (name === 'cpassword' || (name === 'password' && validations.cpassword.touched)) {
      const confirmValue = name === 'cpassword' ? value : input.cpassword;
      const passwordValue = name === 'password' ? value : input.password;
      
      setValidations(prev => ({
        ...prev,
        cpassword: { 
          ...prev.cpassword, 
          valid: confirmValue === passwordValue && confirmValue.length > 0
        }
      }));
    }
  };

  const validateField = (name, value) => {
    let isValid = false;
    
    switch(name) {
      case 'name':
        isValid = value.trim().length >= 2;
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'password':
        isValid = value.length >= 8;
        break;
      case 'cpassword':
        isValid = value === input.password && value.length > 0;
        break;
      default:
        break;
    }
    
    setValidations(prev => ({
      ...prev,
      [name]: { ...prev[name], valid: isValid }
    }));
  };

  const checkPasswordStrength = (password) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    let score = 0;
    if (hasLowercase) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    if (isLongEnough) score++;
    
    setPasswordStrength({
      score,
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasSpecialChar,
      isLongEnough
    });
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score === 0) return '';
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return '#f44336';
    if (passwordStrength.score <= 4) return '#ff9800';
    return '#4caf50';
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const isFormValid = () => {
    return validations.name.valid && 
           validations.email.valid && 
           validations.password.valid && 
           validations.cpassword.valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      showAlert('Please fill all fields correctly', 'error');
      return;
    }

    setLoading(true);

    const userData = {
      name: input.name,
      email: input.email,
      password: input.password
    };

    axios.post('http://localhost:5000/signup', userData)
      .then((response) => {
        if (response.data.Status === 'Success') {
          showAlert('Registered Successfully', 'success');
          setTimeout(() => navigate('/login'), 1500);
        } else if (response.data.Error === 'Email already exists') {
          showAlert('Email already exists', 'error');
        } else {
          showAlert('Registration failed', 'error');
        }
      })
      .catch((error) => {
        console.error(error);
        showAlert('An error occurred', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Get icon color based on validation state
  const getIconColor = (field) => {
    if (!validations[field].touched) return '#94a3b8';
    return validations[field].valid ? '#4caf50' : '#f44336';
  };

  // Animation variants
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Feature item animation variants
  const featureVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: i => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.5
      }
    })
  };

  return (
    <div className="signup-page">
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
      
      <div className="signup-wrapper">
        <motion.div 
          className="signup-left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="signup-left-content">
            <h1>Welcome to LangFix</h1>
            <p className="tagline">Improve your language skills with our interactive exercises and get personalized feedback.</p>
            
            <div className="signup-features">
              <motion.div 
                className="feature-item"
                custom={0}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="feature-icon"></div>
                <div className="feature-text">
                  <strong>Practice writing with AI feedback</strong>
                </div>
              </motion.div>
              <motion.div 
                className="feature-item"
                custom={1}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="feature-icon"></div>
                <div className="feature-text">
                  <strong>Learn to rephrase sentences effectively</strong>
                </div>
              </motion.div>
              <motion.div 
                className="feature-item"
                custom={2}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="feature-icon"></div>
                <div className="feature-text">
                  <strong>Complete stories and build creativity</strong>
                </div>
              </motion.div>
              <motion.div 
                className="feature-item"
                custom={3}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="feature-icon"></div>
                <div className="feature-text">
                  <strong>Track your progress over time</strong>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="signup-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 className="signup-title" variants={itemVariants}>
            Create an Account
          </motion.h2>
          
          <motion.p className="signup-subtitle" variants={itemVariants}>
            Start your language learning journey today
          </motion.p>
          
          <form onSubmit={handleSubmit} className="signup-form">
            <motion.div 
              className={`form-group ${validations.name.touched ? (validations.name.valid ? 'valid' : 'invalid') : ''}`}
              variants={itemVariants}
            >
              <div className="input-icon">
                <User size={18} color={getIconColor('name')} />
              </div>
              <input
                type="text"
                name="name"
                value={input.name}
                onChange={inputHandler}
                className="signup-input"
                placeholder="Full Name"
                required
              />
              {validations.name.touched && !validations.name.valid && (
                <div className="validation-message">Name must be at least 2 characters</div>
              )}
            </motion.div>
            
            <motion.div 
              className={`form-group ${validations.email.touched ? (validations.email.valid ? 'valid' : 'invalid') : ''}`}
              variants={itemVariants}
            >
              <div className="input-icon">
                <Mail size={18} color={getIconColor('email')} />
              </div>
              <input
                type="email"
                name="email"
                value={input.email}
                onChange={inputHandler}
                className="signup-input"
                placeholder="Email Address"
                required
              />
              {validations.email.touched && !validations.email.valid && (
                <div className="validation-message">Please enter a valid email</div>
              )}
            </motion.div>
            
            <motion.div 
              className={`form-group ${validations.password.touched ? (validations.password.valid ? 'valid' : 'invalid') : ''}`}
              variants={itemVariants}
            >
              <div className="input-icon">
                <Lock size={18} color={getIconColor('password')} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={input.password}
                onChange={inputHandler}
                className="signup-input"
                placeholder="Password"
                required
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {validations.password.touched && !validations.password.valid && (
                <div className="validation-message">Password must be at least 8 characters</div>
              )}
            </motion.div>
            
            {input.password && (
              <motion.div 
                className="password-strength"
                variants={itemVariants}
              >
                <div className="strength-bars">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level} 
                      className={`strength-bar ${passwordStrength.score >= level ? 'active' : ''}`}
                      style={{ backgroundColor: passwordStrength.score >= level ? getPasswordStrengthColor() : '' }}
                    ></div>
                  ))}
                </div>
                <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {getPasswordStrengthLabel()}
                </span>
              </motion.div>
            )}
            
            <motion.div 
              className="password-requirements"
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: input.password ? 1 : 0,
                height: input.password ? 'auto' : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <div className={`requirement ${passwordStrength.isLongEnough ? 'met' : ''}`}>
                <span className="dot"></span>
                <span>At least 8 characters</span>
              </div>
              <div className={`requirement ${passwordStrength.hasUppercase ? 'met' : ''}`}>
                <span className="dot"></span>
                <span>At least one uppercase letter</span>
              </div>
              <div className={`requirement ${passwordStrength.hasLowercase ? 'met' : ''}`}>
                <span className="dot"></span>
                <span>At least one lowercase letter</span>
              </div>
              <div className={`requirement ${passwordStrength.hasNumber ? 'met' : ''}`}>
                <span className="dot"></span>
                <span>At least one number</span>
              </div>
              <div className={`requirement ${passwordStrength.hasSpecialChar ? 'met' : ''}`}>
                <span className="dot"></span>
                <span>At least one special character</span>
              </div>
            </motion.div>
            
            <motion.div 
              className={`form-group ${validations.cpassword.touched ? (validations.cpassword.valid ? 'valid' : 'invalid') : ''}`}
              variants={itemVariants}
            >
              <div className="input-icon">
                <Lock size={18} color={getIconColor('cpassword')} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="cpassword"
                value={input.cpassword}
                onChange={inputHandler}
                className="signup-input"
                placeholder="Confirm Password"
                required
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {validations.cpassword.touched && !validations.cpassword.valid && (
                <div className="validation-message">Passwords do not match</div>
              )}
            </motion.div>
            
            <motion.button
              type="submit"
              className="signup-button"
              disabled={!isFormValid() || loading}
              whileHover={isFormValid() && !loading ? { scale: 1.02 } : {}}
              whileTap={isFormValid() && !loading ? { scale: 0.98 } : {}}
              variants={itemVariants}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
            
            <motion.div className="signup-link" variants={itemVariants}>
              Already have an account? <Link to="/login">Log in</Link>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UserSignup;