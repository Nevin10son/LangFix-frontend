import React from 'react';
import { motion } from 'framer-motion';
import './Alert.css';

const Alert = ({ message, type = 'info', onClose }) => {
  const getSymbol = () => {
    switch (type) {
      case 'success':
        return '✔';
      case 'error':
        return '✖';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <motion.div
      className={`alert ${type}`}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      <span className="alert-symbol">{getSymbol()}</span>
      <span className="alert-message">{message}</span>
     
    </motion.div>
  );
};

export default Alert;